# Mino API Reference

> Complete documentation of the TinyFish Mino Playground API based on live testing conducted December 5, 2025.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Session Lifecycle](#session-lifecycle)
5. [Session Log Events](#session-log-events)
6. [Agent Tools](#agent-tools)
7. [Output Formats](#output-formats)
8. [Example Sessions](#example-sessions)

---

## Overview

Mino is a web automation agent that can:
- Navigate websites
- Fill out forms
- Click buttons and interact with UI elements
- Semantically understand page content
- Extract structured data
- Return formatted responses (including markdown tables)

**Base URL:** `https://aitinyfish.com`

**Key Characteristics:**
- Sessions typically complete in 15-60 seconds
- The agent makes autonomous decisions about navigation
- Form interactions are semantic (identifies fields by name, not just selectors)
- Page understanding is AI-powered, not traditional scraping

---

## Authentication

All requests require a JWT token passed in two headers:

```http
Authorization: Bearer <token>
X-Auth-Token: <token>
```

**Token Structure (decoded):**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "exp": 1765047868
}
```

The token expiration (`exp`) is a Unix timestamp.

---

## Endpoints

### 1. Create Session (Start a Query)

```http
POST /api/playground/runs
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_message": "Find USPS shipping cost for a 5lb box from SF to Boston"
}
```

**Response:**
```json
{
  "job_id": null,
  "source": "playground",
  "user_id": null,
  "user_message": "Find USPS shipping cost for a 5lb box from SF to Boston",
  "custom_name": null,
  "web_agent_session_id": "fdfff907-9787-49ec-ad28-4646a7fc9878",
  "status": "running",
  "session_id": "fdfff907-9787-49ec-ad28-4646a7fc9878",
  "session_log": [],
  "output": null,
  "streaming_url": null,
  "error_message": null,
  "created_at": "2025-12-06T00:46:47.065000",
  "started_at": "2025-12-06T00:46:47.065000",
  "completed_at": null,
  "updated_at": "2025-12-06T00:46:47.065000"
}
```

### 2. Get Session Status (Poll for Updates)

```http
GET /api/sessions/{session_id}
```

**Response:** Same structure as create, but with populated `session_log`, `streaming_url`, and eventually `output`.

---

## Session Lifecycle

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Session created, not yet started |
| `running` | Agent is actively working |
| `completed` | Successfully finished with output |
| `error` | Failed with error_message |

### Typical Timeline

```
0s    - Session created (status: running)
1-2s  - Browser initialized (streaming_url available)
2-10s - Navigation begins
10-60s - Form filling, clicking, page analysis
60s+  - Final response generated (status: completed)
```

### Polling Strategy

Recommended: Poll every 2-3 seconds until `status` is `completed` or `error`.

```javascript
const poll = async (sessionId) => {
  const response = await getSessionStatus(sessionId);

  if (response.status === 'completed') {
    return response.output;
  } else if (response.status === 'error') {
    throw new Error(response.error_message);
  }

  // Continue polling
  await sleep(2000);
  return poll(sessionId);
};
```

---

## Session Log Events

The `session_log` array contains all agent actions. Each event has:

```typescript
interface SessionLogEvent {
  type: 'function_call' | 'function_response' | 'final_response';
  data: {
    name?: string;           // Tool name (for function_call/response)
    args?: Record<string, any>;  // Tool arguments (for function_call)
    response?: any;          // Tool result (for function_response)
    raw?: string;            // Final answer text (for final_response)
  };
  role: null;
  author: 'tinyfish_web_agent';
  timestamp: number;         // Unix timestamp with microseconds
  id: string;                // UUID
  finishReason?: 'STOP';     // Present on function_call events
  streaming_url?: string;    // Present on init_browser_tool response
}
```

### Event Flow Pattern

Events always come in pairs for tool usage:

```
function_call (agent decides to use tool)
    ↓
function_response (tool returns result)
    ↓
function_call (next action)
    ↓
function_response
    ↓
... repeat ...
    ↓
final_response (agent's answer to user)
```

---

## Agent Tools

### 1. init_browser_tool

**Purpose:** Initialize a browser session.

**Call:**
```json
{
  "type": "function_call",
  "data": {
    "name": "init_browser_tool",
    "args": {}
  }
}
```

**Response:**
```json
{
  "type": "function_response",
  "data": {
    "name": "init_browser_tool",
    "response": {
      "status": "success",
      "active_browsers": 1,
      "expired_browsers_cleaned": 668,
      "streaming_url": "https://anchorforge.io/devtools-frontend/inspector.html?wss=..."
    }
  },
  "streaming_url": "https://anchorforge.io/devtools-frontend/inspector.html?wss=..."
}
```

**Notes:**
- The `streaming_url` is a Chrome DevTools Protocol inspector URL
- Can be embedded in an iframe for live browser viewing
- URL format: `https://anchorforge.io/devtools-frontend/inspector.html?wss=<websocket-endpoint>`

---

### 2. visit_url_tool

**Purpose:** Navigate to a URL.

**Call:**
```json
{
  "type": "function_call",
  "data": {
    "name": "visit_url_tool",
    "args": {
      "url": "https://www.usps.com"
    }
  }
}
```

**Response:**
```json
{
  "type": "function_response",
  "data": {
    "name": "visit_url_tool",
    "response": {
      "status": "Success",
      "urls_visited": [
        "https://www.usps.com",
        "https://postcalc.usps.com/"
      ]
    }
  }
}
```

**Notes:**
- `urls_visited` is cumulative across the session
- Agent autonomously decides which URLs to visit based on the task

---

### 3. input_text_tool

**Purpose:** Enter text into a form field.

**Call:**
```json
{
  "type": "function_call",
  "data": {
    "name": "input_text_tool",
    "args": {
      "element_id": "39faf402-61fe-4931-b528-dc7b5a357fd6",
      "element_name": "5-Digit ZIP Code",
      "text": "94105",
      "typing": false
    }
  }
}
```

**Response:**
```json
{
  "type": "function_response",
  "data": {
    "name": "input_text_tool",
    "response": {
      "status": "Success",
      "notes": ""
    }
  }
}
```

**Args Explained:**
| Field | Type | Description |
|-------|------|-------------|
| `element_id` | string | Internal UUID for the element |
| `element_name` | string | Human-readable field label (semantic) |
| `text` | string | Value to enter |
| `typing` | boolean | Whether to simulate keystrokes (false = paste) |

---

### 4. click_element_tool

**Purpose:** Click a button, link, or interactive element.

**Call:**
```json
{
  "type": "function_call",
  "data": {
    "name": "click_element_tool",
    "args": {
      "element_id": "ac8cd053-8883-4cc7-97f3-508b9efd37e1",
      "element_name": "Calculate price based on Shape and Size",
      "check_hover_menu": false
    }
  }
}
```

**Response:**
```json
{
  "type": "function_response",
  "data": {
    "name": "click_element_tool",
    "response": {
      "status": "Success"
    }
  }
}
```

**Args Explained:**
| Field | Type | Description |
|-------|------|-------------|
| `element_id` | string | Internal UUID for the element |
| `element_name` | string | Human-readable button/link text |
| `check_hover_menu` | boolean | Whether to check for hover menus first |

---

### 5. page_description_tool

**Purpose:** Ask AI questions about the current page content.

**Call:**
```json
{
  "type": "function_call",
  "data": {
    "name": "page_description_tool",
    "args": {
      "questions": "What are the retail prices for a 5lb package from 94105 to 02108 for Priority Mail, USPS Ground Advantage, and Media Mail?"
    }
  }
}
```

**Response:**
```json
{
  "type": "function_response",
  "data": {
    "name": "page_description_tool",
    "response": {
      "page_description": "This page is the Retail Postage Price Calculator for USPS...\n\n* **Priority Mail Express 2-Day:**\n    * Retail: $96.20\n    * Click-N-Ship: $81.20\n..."
    }
  }
}
```

**Notes:**
- This is where the semantic understanding happens
- The agent formulates specific questions based on the task
- Returns rich, structured descriptions
- Can identify prices, features, options, etc.

---

### 6. final_response

**Purpose:** Deliver the final answer to the user.

**Structure:**
```json
{
  "type": "final_response",
  "data": {
    "raw": "The USPS shipping costs for a 5lb box from San Francisco (94105) to Boston (02108) are as follows:\n\n| Service | Retail Price | Click-N-Ship Price |\n|---------|--------------|--------------------|\n| USPS Ground Advantage | $23.75 | $16.76 |\n..."
  },
  "author": "tinyfish_web_agent",
  "timestamp": 1764982055.342907,
  "id": "4860f951-098d-4ddc-acfc-048a21f17fec",
  "finishReason": "STOP"
}
```

**Notes:**
- Contains markdown formatting (tables, lists, bold)
- Should be rendered with a markdown parser
- Also duplicated in `output.raw` at the session level

---

## Output Formats

### Session Output Object

When `status` is `completed`, the `output` field contains:

```json
{
  "output": {
    "raw": "The price of the AirPods Pro on apple.com is $249."
  }
}
```

### Common Output Formats

**Simple Answer:**
```
The price of the AirPods Pro on apple.com is $249.
```

**Markdown Table:**
```markdown
| Service | Retail Price | Online Price |
|---------|--------------|--------------|
| Ground  | $23.75       | $16.76       |
| Priority| $34.25       | $26.67       |
```

**List with Details:**
```markdown
* **Priority Mail Express 2-Day:**
    * Retail: $96.20
    * Click-N-Ship: $81.20
```

---

## Example Sessions

### Example 1: Simple Price Lookup (8 events, ~25 seconds)

**Query:** "What is the price of AirPods Pro on apple.com?"

**Event Sequence:**
1. `init_browser_tool` → Browser ready
2. `visit_url_tool` → apple.com
3. `visit_url_tool` → apple.com/airpods-pro/
4. `page_description_tool` → "What is the price...?"
5. `final_response` → "$249"

**Output:**
```
The price of the AirPods Pro on apple.com is $249.
```

---

### Example 2: Form-Based Lookup (22 events, ~53 seconds)

**Query:** "Find USPS shipping cost for a 5lb box from SF to Boston"

**Event Sequence:**
1. `init_browser_tool` → Browser ready
2. `visit_url_tool` → usps.com
3. `visit_url_tool` → postcalc.usps.com
4. `input_text_tool` → ZIP: 94105
5. `input_text_tool` → ZIP: 02108
6. `click_element_tool` → "Calculate price..."
7. `input_text_tool` → Pounds: 5
8. `input_text_tool` → Ounces: 0
9. `click_element_tool` → "Package"
10. `page_description_tool` → "What appeared?"
11. `page_description_tool` → "What are the prices?"
12. `final_response` → Formatted price table

**Output:**
```markdown
| Service                     | Retail   | Click-N-Ship |
|-----------------------------|----------|--------------|
| USPS Ground Advantage       | $23.75   | $16.76       |
| Priority Mail               | $34.25   | $26.67       |
| Priority Mail Express 2-Day | $96.20   | $81.20       |
| Media Mail                  | $7.47    | N/A          |
```

---

## Timestamps & Duration Calculation

Each event has a Unix timestamp with microsecond precision:

```javascript
// Calculate step duration
const duration = event2.timestamp - event1.timestamp;
console.log(`Step took ${duration.toFixed(2)} seconds`);

// Calculate total session duration
const totalDuration =
  new Date(session.completed_at) - new Date(session.created_at);
console.log(`Total: ${totalDuration / 1000} seconds`);
```

**Typical Durations:**
- Browser init: 1-2 seconds
- Page navigation: 3-10 seconds
- Form input: 2-4 seconds per field
- Click action: 2-4 seconds
- Page description: 3-6 seconds
- Final response: <1 second

---

## Error Handling

### Session Errors

When `status` is `error`:

```json
{
  "status": "error",
  "error_message": "Session failed: timeout waiting for page load",
  "output": null
}
```

### Common Error Scenarios

| Error | Likely Cause |
|-------|--------------|
| Timeout | Page too slow or complex |
| Navigation failed | URL unreachable |
| Element not found | Page structure changed |
| Rate limited | Too many requests |

---

## Browser Presets (UI Configuration)

The original demo included browser presets (not currently sent to API):

```typescript
const BROWSER_PRESETS = {
  BASIC: {
    browser_type: 'tetra',
    proxy_enabled: false,
  },
  STEALTH: {
    browser_type: 'tetra-anchor',
    proxy_enabled: false,
  },
  GEO_US: {
    browser_type: 'tetra',
    proxy_enabled: true,
    proxy_country_code: 'US',
  },
  GEO_EU: {
    browser_type: 'tetra',
    proxy_enabled: true,
    proxy_country_code: 'DE',
  },
};
```

**Note:** These may be passed to the API in a future version but are currently UI-only.

---

## Streaming URL (Live Browser View)

The `streaming_url` enables live viewing of the browser:

```
https://anchorforge.io/devtools-frontend/inspector.html?wss=tf-{id}.lax1-tinyfish.unikraft.app/devtools/page/{page_id}
```

**Embedding:**
```html
<iframe
  src={streamingUrl}
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
/>
```

**Notes:**
- URL is available after `init_browser_tool` completes
- Shows real-time browser state
- Uses Chrome DevTools Protocol
- May show DevTools UI elements (can be styled/cropped in iframe)

---

## Rate Limits & Best Practices

1. **Polling:** Don't poll faster than every 2 seconds
2. **Concurrent sessions:** Limit to reasonable number
3. **Token expiration:** Check `exp` claim before requests
4. **Timeouts:** Sessions rarely exceed 2 minutes; timeout after 3 minutes

---

## Appendix: Full Session Response Schema

```typescript
interface SessionResponse {
  job_id: string | null;
  source: 'playground';
  user_id: string | null;
  user_message: string;
  custom_name: string | null;
  web_agent_session_id: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  session_id: string;
  session_log: SessionLogEvent[];
  output: { raw: string } | null;
  streaming_url: string | null;
  error_message: string | null;
  created_at: string;  // ISO 8601
  started_at: string;  // ISO 8601
  completed_at: string | null;  // ISO 8601
  updated_at: string;  // ISO 8601
}

interface SessionLogEvent {
  type: 'function_call' | 'function_response' | 'final_response';
  data: FunctionCallData | FunctionResponseData | FinalResponseData;
  role: null;
  author: 'tinyfish_web_agent';
  timestamp: number;
  id: string;
  finishReason?: 'STOP';
  streaming_url?: string;
}

interface FunctionCallData {
  name: string;
  args: Record<string, any>;
}

interface FunctionResponseData {
  name: string;
  response: Record<string, any>;
}

interface FinalResponseData {
  raw: string;
}
```

---

*Documentation generated from live API testing on December 5, 2025.*
