================================================================================
Workflow 1 - Workflow Name: Fiscal 1 - Create Organization
================================================================================
{
  "name": "Fiscal 1 - Create Organization",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "api/organizations",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        0,
        0
      ],
      "id": "1b13ec62-c0f2-44ac-9a1f-f235675611fd",
      "name": "Webhook",
      "webhookId": "69786034-5ec7-419b-9514-ffdb7cce6e81"
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body ?? {};\n\nconst name = body.name;\nconst country = body.country;\n\nif (typeof name !== 'string' || name.trim().length < 2) {\n  throw new Error('Organization name must contain at least 2 characters.');\n}\n\nif (!['AT', 'DE'].includes(country)) {\n  throw new Error('Country must be AT or DE.');\n}\n\nreturn [{\n  json: {\n    name: name.trim(),\n    country\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "9731f89f-5f2c-4cfb-8664-0c478ac9c11f",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public",
          "cachedResultName": "public",
          "cachedResultUrl": ""
        },
        "table": {
          "__rl": true,
          "value": "organizations",
          "mode": "list",
          "cachedResultName": "organizations"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "name": "={{ $json.name }}",
            "country": "={{ $json.country }}"
          },
          "matchingColumns": [
            "id"
          ],
          "schema": [
            {
              "id": "id",
              "displayName": "id",
              "required": false,
              "defaultMatch": true,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "name",
              "displayName": "name",
              "required": true,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "country",
              "displayName": "country",
              "required": true,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "created_at",
              "displayName": "created_at",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "dateTime",
              "canBeUsedToMatch": true
            },
            {
              "id": "updated_at",
              "displayName": "updated_at",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "dateTime",
              "canBeUsedToMatch": true
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        400,
        0
      ],
      "id": "c225ba2e-f7d9-41e7-9dc2-f2f953cd40b9",
      "name": "Insert rows in a table",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "options": {
          "responseCode": 201
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        608,
        0
      ],
      "id": "8d9de7ca-4cfd-4a64-b7a1-cded25263531",
      "name": "Respond to Webhook"
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Insert rows in a table",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert rows in a table": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "5e10e8f9-00b8-4e70-8e1f-9ac3309471f4",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "bJ5oZjrp59vfwijr",
  "tags": []
}

================================================================================
Workflow 2 - Workflow Name: Fiscal 2 - Create Signing Unit
================================================================================
{
  "name": "Fiscal 2 - Create Signing Unit",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "api/signing-units",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        0,
        0
      ],
      "id": "274a154c-edc2-4dc7-bfc2-99eeca981246",
      "name": "Webhook",
      "webhookId": "12f0b49e-4040-47b2-be6f-2e3865b9ac75"
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body ?? {};\n\nconst organizationId = body.organization_id;\nconst name = body.name;\n\nif (\n  typeof organizationId !== 'string' ||\n  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizationId)\n) {\n  throw new Error('A valid organization_id is required.');\n}\n\nif (typeof name !== 'string' || name.trim().length < 2) {\n  throw new Error('Signing unit name must contain at least 2 characters.');\n}\n\nreturn [{\n  json: {\n    organization_id: organizationId,\n    name: name.trim(),\n    status: 'ACTIVE',\n    provider_type: 'MOCK',\n    public_key_id: 'demo-public-key-001'\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "685e16da-f6f9-4811-b590-d68462aadad2",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public",
          "cachedResultName": "public",
          "cachedResultUrl": ""
        },
        "table": {
          "__rl": true,
          "value": "signing_units",
          "mode": "list",
          "cachedResultName": "signing_units"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "name": "={{ $json.name }}",
            "organization_id": "={{ $json.organization_id }}",
            "status": "={{ $json.status }}",
            "provider_type": "={{ $json.provider_type }}",
            "public_key_id": "={{ $json.public_key_id }}"
          },
          "matchingColumns": [
            "id"
          ],
          "schema": [
            {
              "id": "id",
              "displayName": "id",
              "required": false,
              "defaultMatch": true,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "organization_id",
              "displayName": "organization_id",
              "required": true,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "name",
              "displayName": "name",
              "required": true,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "status",
              "displayName": "status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "provider_type",
              "displayName": "provider_type",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "public_key_id",
              "displayName": "public_key_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "created_at",
              "displayName": "created_at",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "dateTime",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "updated_at",
              "displayName": "updated_at",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "dateTime",
              "canBeUsedToMatch": true,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        400,
        0
      ],
      "id": "f324673f-32a1-49d2-9392-2229d54c2244",
      "name": "Insert rows in a table",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "options": {
          "responseCode": 201
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        608,
        0
      ],
      "id": "3edaefa5-db7f-4bb2-8a5d-07f503a6e59b",
      "name": "Respond to Webhook"
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Insert rows in a table",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert rows in a table": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "6c47204e-e859-41af-8fff-50f6d6337b10",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "DCcZH63OBIDB0oJ1",
  "tags": []
}

================================================================================
Workflow 3 - Workflow Name: Fiscal 3 - Create Cash Register
================================================================================
{
  "name": "Fiscal 3 - Create Cash Register",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "api/registers",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        0,
        0
      ],
      "id": "7ca00557-4051-459c-8915-e7eec2252070",
      "name": "Webhook",
      "webhookId": "878bd525-bd93-4f44-9a27-8057af976203"
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body ?? {};\n\nconst uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (!uuidPattern.test(body.organization_id ?? '')) {\n  throw new Error('A valid organization_id is required.');\n}\n\nif (!uuidPattern.test(body.signing_unit_id ?? '')) {\n  throw new Error('A valid signing_unit_id is required.');\n}\n\nif (typeof body.name !== 'string' || body.name.trim().length < 2) {\n  throw new Error('Register name must contain at least 2 characters.');\n}\n\nreturn [{\n  json: {\n    organization_id: body.organization_id,\n    signing_unit_id: body.signing_unit_id,\n    name: body.name.trim(),\n    status: 'ACTIVE',\n    last_sequence: 0\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "bb60a5cc-b051-4b4a-9a44-0869f83cb76f",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "schema": {
          "__rl": true,
          "mode": "list",
          "value": "public",
          "cachedResultName": "public",
          "cachedResultUrl": ""
        },
        "table": {
          "__rl": true,
          "value": "cash_registers",
          "mode": "list",
          "cachedResultName": "cash_registers"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "name": "={{ $json.name }}",
            "organization_id": "={{ $json.organization_id }}",
            "status": "={{ $json.status }}",
            "signing_unit_id": "={{ $json.signing_unit_id }}",
            "last_sequence": "={{ $json.last_sequence }}"
          },
          "matchingColumns": [
            "id"
          ],
          "schema": [
            {
              "id": "id",
              "displayName": "id",
              "required": false,
              "defaultMatch": true,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "organization_id",
              "displayName": "organization_id",
              "required": true,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "signing_unit_id",
              "displayName": "signing_unit_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "name",
              "displayName": "name",
              "required": true,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "status",
              "displayName": "status",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "last_sequence",
              "displayName": "last_sequence",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "number",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "created_at",
              "displayName": "created_at",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "dateTime",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "updated_at",
              "displayName": "updated_at",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "dateTime",
              "canBeUsedToMatch": true,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        400,
        0
      ],
      "id": "111cbda5-0feb-4018-a740-6a6855eae196",
      "name": "Insert rows in a table",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "options": {
          "responseCode": 201
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        608,
        0
      ],
      "id": "b9f926c9-791e-41f5-ab96-70a85901cfc3",
      "name": "Respond to Webhook"
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Insert rows in a table",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert rows in a table": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "453f278b-82d1-47fb-b7b1-91de8df23c78",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "D2jBqSaGtQvPb7ak",
  "tags": []
}

================================================================================
Workflow 4 - Workflow Name: Fiscal 4 - Submit Receipt
================================================================================
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "api/receipts",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        -160,
        0
      ],
      "id": "d45c6c8a-3b92-44f5-952a-766c613e26e1",
      "name": "Webhook",
      "webhookId": "08f0720d-4b13-4f46-8b08-3584b3a08bfb"
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body ?? {};\n\nconst uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (!uuidPattern.test(body.register_id ?? '')) {\n  throw new Error('A valid register_id is required.');\n}\n\nif (typeof body.receipt_number !== 'string' || !body.receipt_number.trim()) {\n  throw new Error('receipt_number is required.');\n}\n\nif (!Number.isSafeInteger(body.amount_cents) || body.amount_cents < 0) {\n  throw new Error('amount_cents must be a non-negative integer.');\n}\n\nif (!Array.isArray(body.vat_breakdown)) {\n  throw new Error('vat_breakdown must be an array.');\n}\n\nreturn [{\n  json: {\n    register_id: body.register_id,\n    receipt_number: body.receipt_number.trim(),\n    amount_cents: body.amount_cents,\n    currency: 'EUR',\n    vat_breakdown: body.vat_breakdown,\n    receipt_payload: {\n      receipt_number: body.receipt_number.trim(),\n      amount_cents: body.amount_cents,\n      currency: 'EUR',\n      vat_breakdown: body.vat_breakdown\n    },\n    status: 'PENDING'\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        0,
        0
      ],
      "id": "dbecf608-a4c8-4068-bba7-49c171a93132",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}",
        "options": {
          "responseCode": 201
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        1232,
        0
      ],
      "id": "a973ccba-f73a-43d7-bc95-ff3eaef88916",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT public.allocate_register_sequence($1) AS sequence_number;",
        "options": {
          "queryReplacement": "={{ $('Code in JavaScript').first().json.register_id }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        176,
        0
      ],
      "id": "bd496f6f-fb9c-45e7-b5fb-eeb11080984c",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const receipt = $('Code in JavaScript').first().json;\nconst allocation = $input.first().json;\n\nreturn [{\n  json: {\n    ...receipt,\n    sequence_number: Number(allocation.sequence_number)\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        368,
        0
      ],
      "id": "1153eb13-c6fb-401c-b4de-5ab829a865b5",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "\nINSERT INTO receipts (\n  register_id,\n  receipt_number,\n  sequence_number,\n  amount_cents,\n  currency,\n  vat_breakdown,\n  receipt_payload,\n  status\n)\nVALUES (\n  $1,\n  $2,\n  $3,\n  $4,\n  $5,\n  $6::jsonb,\n  $7::jsonb,\n  $8\n)\nRETURNING\n  id,\n  register_id,\n  receipt_number,\n  sequence_number,\n  amount_cents,\n  currency,\n  vat_breakdown,\n  receipt_payload,\n  status;\n",
        "options": {
          "queryReplacement": "={{ $json.register_id }} {{ $json.receipt_number }} {{ $json.sequence_number }} {{ $json.amount_cents }} {{ $json.currency }} {{ JSON.stringify($json.vat_breakdown) }} {{ JSON.stringify($json.receipt_payload) }} {{ $json.status }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        592,
        0
      ],
      "id": "25880ebc-07e6-4293-b1a6-29316db3917a",
      "name": "Execute a SQL query1",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "\nconst created = $('Execute a SQL query1').first().json;\n\nif (!created || typeof created.id !== 'string') {\n  throw new Error('WF-04 insert did not return a receipt UUID.');\n}\n\nreturn [{\n  json: {\n    ok: true,\n    success: true,\n    id: created.id,\n    receipt_id: created.id,\n    receipt: created,\n    data: created,\n    receipt_number: created.receipt_number,\n    sequence_number: created.sequence_number,\n    status: created.status\n  }\n}];\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1040,
        0
      ],
      "id": "067803e9-3856-47e1-98b9-99ff5b8eeea8",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "\nINSERT INTO audit_events (\n  organization_id,\n  register_id,\n  receipt_id,\n  event_type,\n  payload\n)\nSELECT\n  cr.organization_id,\n  r.register_id,\n  r.id,\n  'RECEIPT_CREATED',\n  jsonb_build_object(\n    'receipt_number', r.receipt_number,\n    'sequence_number', r.sequence_number,\n    'amount_cents', r.amount_cents,\n    'currency', r.currency,\n    'source', 'WF-04'\n  )\nFROM receipts r\nJOIN cash_registers cr ON cr.id = r.register_id\nWHERE r.id = $1\nRETURNING id, event_type, receipt_id;\n",
        "options": {
          "queryReplacement": "={{ $('Execute a SQL query1').first().json.id }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        816,
        0
      ],
      "id": "a59eea2b-727b-4e0d-bc48-3aed65b1bca7",
      "name": "Execute a SQL query2",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "Execute a SQL query1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query1": {
      "main": [
        [
          {
            "node": "Execute a SQL query2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query2": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  }
}

================================================================================
Workflow 5 - Workflow Name: Fiscal 5 - Receipt Signing
================================================================================
{
  "name": "Fiscal 5 - Receipt Signing",
  "nodes": [
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        1120,
        176
      ],
      "id": "64b90a87-b6ee-4ddd-a795-67e07364fa58",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "api/receipts/sign",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        32,
        272
      ],
      "id": "920fce51-46fe-4511-bd79-3aa2bde0db6e",
      "name": "Webhook1",
      "webhookId": "c4c1e4d6-e2ac-453d-a87b-0d441d78a964"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "d769481c-fc18-4dbb-abe8-1727f411e6c3",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        480,
        272
      ],
      "id": "f169547e-19e0-4d93-b382-1133647dc1da",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT public.sign_receipt($1) AS result;",
        "options": {
          "queryReplacement": "={{ [ $('Validate Input').first().json.receipt_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        704,
        176
      ],
      "id": "a7a1c701-1ae2-48ab-8bd1-49956d7152b4",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body ?? {};\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nconst receiptId = body.receipt_id;\n\nif (typeof receiptId !== 'string' || !uuidPattern.test(receiptId)) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_RECEIPT_ID',\n      message: 'A valid receipt_id UUID is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    receipt_id: receiptId\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        256,
        272
      ],
      "id": "ef20ee30-427b-4ed2-b4bf-d2b99a33e1a9",
      "name": "Validate Input"
    },
    {
      "parameters": {
        "jsCode": "const result = $input.first().json.result;\n\nif (!result) {\n  return [{\n    json: {\n      http_status: 500,\n      body: {\n        success: false,\n        error: 'SIGNING_FAILED',\n        message: 'The signing operation returned no result.'\n      }\n    }\n  }];\n}\n\nif (result.ok) {\n  return [{\n    json: {\n      http_status: 200,\n      body: {\n        success: true,\n        data: result.data,\n        already_signed: result.already_signed ?? false\n      }\n    }\n  }];\n}\n\nconst statusCodes = {\n  RECEIPT_NOT_FOUND: 404,\n  REGISTER_NOT_FOUND: 404,\n  INVALID_RECEIPT_STATUS: 409,\n  PREVIOUS_RECEIPT_NOT_SIGNED: 409,\n  SIGNING_CONFIG_INVALID: 422\n};\n\nreturn [{\n  json: {\n    http_status: statusCodes[result.error] ?? 500,\n    body: {\n      success: false,\n      error: result.error ?? 'SIGNING_FAILED',\n      message: 'The receipt could not be signed.'\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        928,
        176
      ],
      "id": "f734ba0b-917c-434f-b7b4-1bc63a9aa13f",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: false, error: $json.error, message: $json.message } }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        944,
        400
      ],
      "id": "d8e96460-b93c-4ae2-925a-a7581ddc9d93",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Validate Input').first().json) }}",
            "workflow_name": "Fiscal 5 - Receipt Signing"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        704,
        400
      ],
      "id": "25c0540f-5ad1-490a-867a-fde5453abb86",
      "name": "Insert row",
      "alwaysOutputData": true
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook1": {
      "main": [
        [
          {
            "node": "Validate Input",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Validate Input": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "3848cde9-d1b3-4bb6-8377-9a5b529c79b7",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "ZHxek2kGQ7exbFuy",
  "tags": []
}

================================================================================
Workflow 6 - Workflow Name: Fiscal 6 - Receipt Verification
================================================================================
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "api/receipts/verify",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        0,
        0
      ],
      "id": "b9d8faa8-3d6d-4bed-abe9-50c3602f76d4",
      "name": "Webhook",
      "webhookId": "e05124eb-297b-4a0b-8b27-41836a4537f9"
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json.body ?? {};\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nconst receiptId = body.receipt_id;\n\nif (typeof receiptId !== 'string' || !uuidPattern.test(receiptId)) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_RECEIPT_ID',\n      message: 'A valid receipt_id UUID is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    receipt_id: receiptId\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "c2ca2754-f1e9-4b1c-96f1-c74bf01710f4",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "def3c8ff-e3e6-428f-8ce1-d80b7c7b4deb",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        448,
        0
      ],
      "id": "dab1893e-a4d4-488d-8f4a-2dddae916eb6",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT public.verify_receipt($1) AS result;",
        "options": {
          "queryReplacement": "={{ [ $('Code in JavaScript').first().json.receipt_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        656,
        -96
      ],
      "id": "432686c1-4e25-4ab8-bfb5-390b61e3ba54",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const result = $('Execute a SQL query').first().json.result;\n\nif (!result) {\n  return [{\n    json: {\n      http_status: 500,\n      body: {\n        success: false,\n        error: 'VERIFICATION_FAILED',\n        message: 'The verification operation returned no result.'\n      }\n    }\n  }];\n}\n\nif (result.found === false) {\n  return [{\n    json: {\n      http_status: 404,\n      body: {\n        success: false,\n        error: result.error\n      }\n    }\n  }];\n}\n\nif (result.error === 'RECEIPT_NOT_SIGNED') {\n  return [{\n    json: {\n      http_status: 409,\n      body: {\n        success: false,\n        error: result.error,\n        status: result.status\n      }\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      data: result\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1360,
        -80
      ],
      "id": "4bae408d-2642-403c-8532-e3f9c55648f8",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        1568,
        -80
      ],
      "id": "b3004f31-d5ad-4779-b2a9-be9ac5b0b6e0",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: false, error: $json.error, message: $json.message } }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        864,
        112
      ],
      "id": "0a876170-3435-4eb8-a9f7-12dfab5fce89",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript').first().json) }}",
            "workflow_name": "Fiscal 6 - Receipt Verification"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        656,
        112
      ],
      "id": "e3cd1420-35a0-4213-b65a-0d85c6b3f1ea",
      "name": "Insert row",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "e1ec197b-d5e7-4235-a176-d35202fc7f59",
              "leftValue": "={{ $json.result.found }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        848,
        -96
      ],
      "id": "4bc7bfe8-4586-40e9-a290-88752d87af05",
      "name": "If1"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO audit_events (\n  organization_id,\n  register_id,\n  receipt_id,\n  event_type,\n  payload\n)\nSELECT\n  cr.organization_id,\n  r.register_id,\n  r.id,\n  CASE\n    WHEN COALESCE(($2::jsonb ->> 'valid')::boolean, false)\n      THEN 'RECEIPT_VERIFIED'\n    ELSE 'RECEIPT_VERIFICATION_FAILED'\n  END,\n  jsonb_build_object(\n    'valid', ($2::jsonb -> 'valid'),\n    'checks', ($2::jsonb -> 'checks'),\n    'error', ($2::jsonb -> 'error'),\n    'source', 'WF-06'\n  )\nFROM receipts r\nJOIN cash_registers cr ON cr.id = r.register_id\nWHERE r.id = $1::uuid\nRETURNING id, event_type, receipt_id;\n",
        "options": {
          "queryReplacement": "={{ [\n  $('Code in JavaScript').first().json.receipt_id,\n  JSON.stringify($('Execute a SQL query').first().json.result)\n] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        1104,
        -208
      ],
      "id": "517fcf58-4c9e-47fb-8b2a-d884209b3572",
      "name": "Execute a SQL query1",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Execute a SQL query1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query1": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  }
}

================================================================================
Workflow 7 - Workflow Name: Fiscal 7 - Receipt Retrieval
================================================================================
{
  "name": "Fiscal 7 - Receipt Retrieval",
  "nodes": [
    {
      "parameters": {
        "path": "api/receipts/:id",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        0,
        0
      ],
      "id": "21fb9d45-b0a2-4bc8-9f8c-2275f81af7d2",
      "name": "Webhook",
      "webhookId": "9c19c503-ff8c-426a-b6db-d9db4b89f547"
    },
    {
      "parameters": {
        "jsCode": "const id = $input.first().json.params?.id;\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (typeof id !== 'string' || !uuidPattern.test(id)) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_RECEIPT_ID',\n      message: 'A valid receipt ID is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    receipt_id: id\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "198a7f7d-84f0-41fd-8914-de757caf2b11",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "79e7f33a-df60-4184-85ed-001cd82c0460",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        448,
        0
      ],
      "id": "13052235-3fcd-4851-b2ac-f7f1a1547532",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    EXISTS (\n        SELECT 1\n        FROM public.receipts\n        WHERE id = $1\n    ) AS found,\n    (\n        SELECT to_jsonb(r)\n        FROM public.receipts r\n        WHERE r.id = $1\n    ) AS data;",
        "options": {
          "queryReplacement": "={{ [ $('Code in JavaScript').first().json.receipt_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        672,
        -96
      ],
      "id": "6363f0a1-a6c1-4ed3-acf3-12d3c19e5780",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const result = $input.first().json;\n\nif (!result.found) {\n  return [{\n    json: {\n      http_status: 404,\n      body: {\n        success: false,\n        error: 'RECEIPT_NOT_FOUND',\n        message: 'The requested receipt was not found.'\n      }\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      data: result.data\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        848,
        -96
      ],
      "id": "9e5f92ea-bf6d-44e9-9e3f-282b5f276600",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        1024,
        -96
      ],
      "id": "45fcbd0f-c8b7-448a-920d-a06338c10e8d",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  success: false,\n  error: $json.error,\n  message: $json.message\n} }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        800,
        96
      ],
      "id": "413f6512-127c-47ad-b24a-2d95b038583b",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "path": "api/registers/:id/receipts",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        16,
        464
      ],
      "id": "1ef36337-7103-4136-8453-a9e793c300f6",
      "name": "Webhook1",
      "webhookId": "9c19c503-ff8c-426a-b6db-d9db4b89f547"
    },
    {
      "parameters": {
        "jsCode": "const id = $input.first().json.params?.id;\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (typeof id !== 'string' || !uuidPattern.test(id)) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_REGISTER_ID',\n      message: 'A valid register ID is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    register_id: id\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        240,
        464
      ],
      "id": "7e13d00d-327f-4d43-bf24-e9ff5a86fa6e",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "79e7f33a-df60-4184-85ed-001cd82c0460",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        464,
        464
      ],
      "id": "ce9a93c9-7b2d-47de-a038-8c267bcd1aec",
      "name": "If1"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    EXISTS (\n        SELECT 1\n        FROM public.cash_registers\n        WHERE id = $1\n    ) AS found,\n    COALESCE(\n        (\n            SELECT jsonb_agg(to_jsonb(r) ORDER BY r.sequence_number DESC)\n            FROM (\n                SELECT *\n                FROM public.receipts\n                WHERE register_id = $1\n                ORDER BY sequence_number DESC\n                LIMIT 50\n            ) r\n        ),\n        '[]'::jsonb\n    ) AS receipts;",
        "options": {
          "queryReplacement": "={{ [ $('Code in JavaScript2').first().json.register_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        688,
        368
      ],
      "id": "2b89068c-1020-4dcb-b620-962bf04e69ee",
      "name": "Execute a SQL query1",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const result = $input.first().json;\n\nif (!result.found) {\n  return [{\n    json: {\n      http_status: 404,\n      body: {\n        success: false,\n        error: 'REGISTER_NOT_FOUND',\n        message: 'The requested cash register was not found.'\n      }\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      count: result.receipts.length,\n      data: result.receipts\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        864,
        368
      ],
      "id": "9d538652-1b62-4e6d-ab18-7713715082ea",
      "name": "Code in JavaScript3"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        1040,
        368
      ],
      "id": "cd73b1f6-8831-40f3-8aea-106b37791571",
      "name": "Respond to Webhook2"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  success: false,\n  error: $json.error,\n  message: $json.message\n} }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        896,
        544
      ],
      "id": "4fc61de3-82af-4a59-8363-73bbcd8fca8a",
      "name": "Respond to Webhook3"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript').first().json) }}",
            "workflow_name": "Fiscal 7 - Receipt Retrieval"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        624,
        96
      ],
      "id": "fd8c6e93-3669-447e-8cf4-6c448574a60e",
      "name": "Insert row",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript2').first().json) }}",
            "workflow_name": "Fiscal 7 - Receipt Retrieval"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        704,
        544
      ],
      "id": "211bdc8b-4560-4f3a-97b3-babb27f64c21",
      "name": "Insert row1",
      "alwaysOutputData": true
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook1": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Execute a SQL query1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query1": {
      "main": [
        [
          {
            "node": "Code in JavaScript3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript3": {
      "main": [
        [
          {
            "node": "Respond to Webhook2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row1": {
      "main": [
        [
          {
            "node": "Respond to Webhook3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "c6b2ba51-6d38-4b6e-bc77-65f3000c676d",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "3bgNzmPdU9k4RuWY",
  "tags": []
}

================================================================================
Workflow 8 - Workflow Name: Fiscal 8 - Audit Managment
================================================================================
{
  "name": "Fiscal 8 - Audit Managment",
  "nodes": [
    {
      "parameters": {
        "path": "/api/audit",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        -480,
        0
      ],
      "id": "a1acb73b-da0c-4a07-82db-2f3d2f352b10",
      "name": "Webhook",
      "webhookId": "9c19c503-ff8c-426a-b6db-d9db4b89f547"
    },
    {
      "parameters": {
        "jsCode": "const organizationId =\n  $input.first().json.query?.organization_id;\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (\n  typeof organizationId !== 'string' ||\n  !uuidPattern.test(organizationId)\n) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_ORGANIZATION_ID',\n      message: 'A valid organization_id query parameter is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    organization_id: organizationId\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -256,
        0
      ],
      "id": "229fd3bb-cd80-4ee2-9391-6a601213e9c3",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "79e7f33a-df60-4184-85ed-001cd82c0460",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        -32,
        0
      ],
      "id": "6bdfd2c2-8bca-4515-acfd-1d9b838b5aea",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    id,\n    organization_id,\n    register_id,\n    receipt_id,\n    event_type,\n    payload,\n    created_at\nFROM public.audit_events\nWHERE organization_id = $1\nORDER BY created_at DESC\nLIMIT 100;",
        "options": {
          "queryReplacement": "={{ [ $('Code in JavaScript').first().json.organization_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        208,
        -96
      ],
      "id": "c36bf56b-2bcb-4601-974d-92c2a7074aaa",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const events = $input.all().map(item => item.json);\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      count: events.length,\n      data: events\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        384,
        -96
      ],
      "id": "d9bd7575-6742-4c0d-b22c-595669c1a2ea",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        544,
        -96
      ],
      "id": "45a09339-c6c7-491c-8c1b-f2f03217fbf9",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  success: false,\n  error: $json.error,\n  message: $json.message\n} }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        416,
        96
      ],
      "id": "32dd042a-b056-42da-9533-f46ab885b681",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "path": "api/audit/events/:id",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        -512,
        496
      ],
      "id": "7aa0d1aa-5471-4f37-a7f7-f82796b31912",
      "name": "Webhook1",
      "webhookId": "9c19c503-ff8c-426a-b6db-d9db4b89f547"
    },
    {
      "parameters": {
        "jsCode": "const id = $input.first().json.params?.id;\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (typeof id !== 'string' || !uuidPattern.test(id)) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_AUDIT_EVENT_ID',\n      message: 'A valid audit event ID is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    audit_event_id: id\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -288,
        496
      ],
      "id": "1fb090a6-22c6-4750-8b90-f805c88a7b05",
      "name": "Code in JavaScript2"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "79e7f33a-df60-4184-85ed-001cd82c0460",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        -64,
        496
      ],
      "id": "ca6e072e-1de1-4cb0-900e-6cfb87e53327",
      "name": "If1"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    id,\n    organization_id,\n    register_id,\n    receipt_id,\n    event_type,\n    payload,\n    created_at\nFROM public.audit_events\nWHERE id = $1\nLIMIT 1;",
        "options": {
          "queryReplacement": "={{ [ $('Code in JavaScript2').first().json.audit_event_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        176,
        400
      ],
      "id": "cf543cc9-be7a-4ec3-ab82-9afff87e344e",
      "name": "Execute a SQL query1",
      "alwaysOutputData": true,
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const event = $input.first().json;\n\nif (!event.id) {\n  return [{\n    json: {\n      http_status: 404,\n      body: {\n        success: false,\n        error: 'AUDIT_EVENT_NOT_FOUND',\n        message: 'The requested audit event was not found.'\n      }\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      data: event\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        352,
        400
      ],
      "id": "dee2bb6a-dd35-4c11-bcad-b21853343e55",
      "name": "Code in JavaScript3"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        512,
        400
      ],
      "id": "6e241df0-ea90-41a5-a1c4-af5886ea854b",
      "name": "Respond to Webhook2"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  success: false,\n  error: $json.error,\n  message: $json.message\n} }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        336,
        576
      ],
      "id": "65776ec0-0be2-4219-8670-623ce5c15cee",
      "name": "Respond to Webhook3"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript').first().json) }}",
            "workflow_name": "Fiscal 8 - Audit Management"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        208,
        96
      ],
      "id": "4372ea3f-d892-4fe6-814e-d8d6cd81ed8a",
      "name": "Insert row",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript2').first().json) }}",
            "workflow_name": "Fisca 8 - Audit Management"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        160,
        576
      ],
      "id": "1c780517-8653-46e9-9e8e-2ff2aba618d5",
      "name": "Insert row1",
      "alwaysOutputData": true
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook1": {
      "main": [
        [
          {
            "node": "Code in JavaScript2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript2": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Execute a SQL query1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query1": {
      "main": [
        [
          {
            "node": "Code in JavaScript3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript3": {
      "main": [
        [
          {
            "node": "Respond to Webhook2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row1": {
      "main": [
        [
          {
            "node": "Respond to Webhook3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "616b87b3-1c19-408d-ab92-0601eb51fc68",
  "meta": {
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "rlKp87bHukKpHYtt",
  "tags": []
}

================================================================================
Workflow 9 - Workflow Name: Fiscal 9 - Receipt Export
================================================================================
{
  "name": "Fiscal 9 - Receipt Export",
  "nodes": [
    {
      "parameters": {
        "path": "api/registers/export",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        0,
        0
      ],
      "id": "84fcee98-7291-451a-8bad-4f987fae4786",
      "name": "Webhook",
      "webhookId": "698bce24-c797-4031-b0a5-6e88520894b5"
    },
    {
      "parameters": {
        "jsCode": "const registerId =\n  $input.first().json.query?.register_id;\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (\n  typeof registerId !== 'string' ||\n  !uuidPattern.test(registerId)\n) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_REGISTER_ID',\n      message: 'A valid register_id query parameter is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    register_id: registerId\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "8e7736ab-0b89-4c54-bced-b44025b6d3bf",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "5624d4e6-57f5-4757-ba7e-7b72f4907a54",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        384,
        0
      ],
      "id": "44b2bf32-0783-4c71-a433-759ccec6457d",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT\n    cr.id AS register_id,\n    cr.name AS register_name,\n    cr.organization_id,\n    COALESCE(\n        jsonb_agg(\n            to_jsonb(r)\n            ORDER BY r.sequence_number\n        ) FILTER (WHERE r.id IS NOT NULL),\n        '[]'::jsonb\n    ) AS receipts\nFROM public.cash_registers cr\nLEFT JOIN (\n    SELECT *\n    FROM public.receipts\n    WHERE register_id = $1\n    ORDER BY sequence_number\n    LIMIT 1000\n) r ON r.register_id = cr.id\nWHERE cr.id = $1\nGROUP BY cr.id, cr.name, cr.organization_id;",
        "options": {
          "queryReplacement": "={{ [ $('Code in JavaScript').first().json.register_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        608,
        -80
      ],
      "id": "ea94a18b-b36c-4069-9258-28916465e391",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        944,
        -80
      ],
      "id": "abf921b8-b665-4967-af74-ab069b7a5f76",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "jsCode": "const row = $input.first().json;\n\nif (!row.register_id) {\n  return [{\n    json: {\n      http_status: 404,\n      body: {\n        success: false,\n        error: 'REGISTER_NOT_FOUND',\n        message: 'The requested cash register was not found.'\n      }\n    }\n  }];\n}\n\nlet receipts = row.receipts ?? [];\n\nif (typeof receipts === 'string') {\n  receipts = JSON.parse(receipts);\n}\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      export: {\n        format: 'JSON',\n        version: 1,\n        generated_at: new Date().toISOString(),\n        register: {\n          id: row.register_id,\n          name: row.register_name,\n          organization_id: row.organization_id\n        },\n        receipt_count: receipts.length,\n        receipts: receipts\n      }\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        784,
        -80
      ],
      "id": "7dedb94f-9356-4de8-9a07-6097ed882675",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  success: false,\n  error: $json.error,\n  message: $json.message\n} }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        768,
        112
      ],
      "id": "fc701bdc-d778-4ad3-9778-bb3447f5f2b5",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript').first().json) }}",
            "workflow_name": "Fiscal 9 - Receipt Export"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        592,
        112
      ],
      "id": "fc8a2442-7e72-497c-bfa2-c20953d34cb6",
      "name": "Insert row",
      "alwaysOutputData": true
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "6e0f1b89-84df-4d06-aaea-6d645e1f52de",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "bNRGP8jWYAHSIMoH",
  "tags": []
}

================================================================================
Workflow 10 - Workflow Name: Fiscal 10 - Integrity Check
================================================================================
{
  "name": "Fiscal 10 - Integrity Check",
  "nodes": [
    {
      "parameters": {
        "path": "api/registers/integrity-check",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.2,
      "position": [
        -464,
        0
      ],
      "id": "478cb663-3337-47f3-8133-adae8392a435",
      "name": "Webhook",
      "webhookId": "698bce24-c797-4031-b0a5-6e88520894b5"
    },
    {
      "parameters": {
        "jsCode": "const registerId =\n  $input.first().json.query?.register_id;\n\nconst uuidPattern =\n  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n\nif (\n  typeof registerId !== 'string' ||\n  !uuidPattern.test(registerId)\n) {\n  return [{\n    json: {\n      valid: false,\n      error: 'INVALID_REGISTER_ID',\n      message: 'A valid register_id query parameter is required.'\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    valid: true,\n    register_id: registerId\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -240,
        0
      ],
      "id": "99d734d9-38e6-4ad3-b8c2-70e2f39e1318",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 4
          },
          "conditions": [
            {
              "id": "5624d4e6-57f5-4757-ba7e-7b72f4907a54",
              "leftValue": "={{ $json.valid }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.4,
      "position": [
        -80,
        0
      ],
      "id": "b1c9cf2b-9f08-4c92-8aed-8e78cf25c898",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT public.check_register_integrity($1) AS result;",
        "options": {
          "queryReplacement": "=={{ [ $('Code in JavaScript').first().json.register_id ] }}"
        }
      },
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.8,
      "position": [
        144,
        -80
      ],
      "id": "a967486b-52b6-4d1e-9596-ab371046fa92",
      "name": "Execute a SQL query",
      "credentials": {
        "postgres": {
          "id": "Jyg4HC85w2ML61f7",
          "name": "fiscalization"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json.body }}",
        "options": {
          "responseCode": "={{ $json.http_status }}"
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        480,
        -80
      ],
      "id": "c5e6cf4a-a2c7-4e43-a7c8-00b6c39d3107",
      "name": "Respond to Webhook"
    },
    {
      "parameters": {
        "jsCode": "let result = $input.first().json.result;\n\nif (typeof result === 'string') {\n  result = JSON.parse(result);\n}\n\nif (!result) {\n  return [{\n    json: {\n      http_status: 500,\n      body: {\n        success: false,\n        error: 'INTEGRITY_CHECK_FAILED',\n        message: 'The integrity check returned no result.'\n      }\n    }\n  }];\n}\n\nif (result.found === false) {\n  return [{\n    json: {\n      http_status: 404,\n      body: {\n        success: false,\n        error: result.error\n      }\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    http_status: 200,\n    body: {\n      success: true,\n      data: result\n    }\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        320,
        -80
      ],
      "id": "bce85816-bdaa-4cdc-8be2-b5cd7477058e",
      "name": "Code in JavaScript1"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ {\n  success: false,\n  error: $json.error,\n  message: $json.message\n} }}",
        "options": {
          "responseCode": 400
        }
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        320,
        96
      ],
      "id": "2da82c88-e2a2-4cdd-9130-df4d80ca237e",
      "name": "Respond to Webhook1"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "VALIDATION",
            "workflow_id": "={{ $workflow.id }}",
            "execution_id": "={{ $execution.id }}",
            "error_code": "={{ $json.error }}",
            "error_message": "={{ $json.message }}",
            "request_data": "={{ JSON.stringify($('Code in JavaScript').first().json) }}",
            "workflow_name": "Fiscal 10 - Integrity Check"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        144,
        96
      ],
      "id": "b0573b7e-14af-4302-9fbe-6381d98f717b",
      "name": "Insert row",
      "alwaysOutputData": true
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Execute a SQL query",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute a SQL query": {
      "main": [
        [
          {
            "node": "Code in JavaScript1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript1": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Insert row": {
      "main": [
        [
          {
            "node": "Respond to Webhook1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate",
    "timeSavedMode": "fixed",
    "errorWorkflow": "R5AuoEfWgwGFM7r8",
    "callerPolicy": "workflowsFromSameOwner",
    "availableInMCP": false
  },
  "versionId": "107e08cd-af2d-4c51-8597-2817dce90951",
  "meta": {
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "0nZK7qR25xagDGHA",
  "tags": []
}

================================================================================
Workflow 11 - Workflow Name: Fiscal 11 - Global Error Handler
================================================================================
{
  "name": "Fiscal 11 - Global Error Handler",
  "nodes": [
    {
      "parameters": {},
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ],
      "id": "dcf52462-934d-455c-a190-1d69ed197b3f",
      "name": "Error Trigger"
    },
    {
      "parameters": {
        "jsCode": "const errorData = $input.first().json;\n\nconst execution = errorData.execution ?? {};\nconst workflow = errorData.workflow ?? {};\n\nreturn [{\n  json: {\n    timestamp: new Date().toISOString(),\n    workflow_name: workflow.name ?? 'Unknown workflow',\n    workflow_id: workflow.id ?? null,\n    execution_id: execution.id ?? null,\n    execution_url: execution.url ?? null,\n    error_message:\n      execution.error?.message ??\n      errorData.error?.message ??\n      'Unknown technical error',\n    error_stack:\n      execution.error?.stack ??\n      errorData.error?.stack ??\n      null\n  }\n}];"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        224,
        0
      ],
      "id": "4c32e7da-fbb6-4e40-818c-87ce80ebda76",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "RuxbSObODwS071ot",
          "mode": "list",
          "cachedResultName": "fiscal_application_errors",
          "cachedResultUrl": "/projects/LZrZqiUdUK1IbeDy/datatables/RuxbSObODwS071ot"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "category": "TECHNICAL",
            "workflow_name": "={{ $json.workflow_name }}",
            "workflow_id": "={{ $json.workflow_id }}",
            "execution_id": "={{ $json.execution_id }}",
            "error_code": "TECHNICAL_ERROR",
            "error_message": "={{ $json.error_message }}",
            "request_data": "={{ JSON.stringify({ timestamp: $json.timestamp, execution_url: $json.execution_url, error_stack: $json.error_stack }) }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "category",
              "displayName": "category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_name",
              "displayName": "workflow_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "workflow_id",
              "displayName": "workflow_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "execution_id",
              "displayName": "execution_id",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_code",
              "displayName": "error_code",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "error_message",
              "displayName": "error_message",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "request_data",
              "displayName": "request_data",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1.1,
      "position": [
        400,
        0
      ],
      "id": "8f904642-2170-4d49-9dc7-8707cab29217",
      "name": "Insert row"
    }
  ],
  "pinData": {},
  "connections": {
    "Error Trigger": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Code in JavaScript": {
      "main": [
        [
          {
            "node": "Insert row",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1",
    "binaryMode": "separate"
  },
  "versionId": "592983eb-9a84-4443-8b88-2f8aab5f1717",
  "meta": {
    "instanceId": "a6e6e457673b20bca580be4e2c0fbb88dcf05b760c98e9a9ec1bff96c57048d7"
  },
  "nodeGroups": [],
  "id": "R5AuoEfWgwGFM7r8",
  "tags": []
}
