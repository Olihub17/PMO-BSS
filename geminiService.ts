
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectAssets, WBSItem } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ASSET_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        projectName: { type: Type.STRING },
        preparedBy: { type: Type.STRING },
        date: { type: Type.STRING },
        organization: { type: Type.STRING }
      },
      required: ["projectName", "preparedBy", "date", "organization"]
    },
    summary: { type: Type.STRING },
    wbs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          reqId: { type: Type.STRING, description: "Map back to Requirement ID from the source doc" },
          title: { type: Type.STRING },
          subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "reqId", "title", "subtasks"]
      }
    },
    hld: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          techStack: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "description", "techStack"]
      }
    },
    lld: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          moduleName: { type: Type.STRING },
          details: { type: Type.STRING },
          dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["moduleName", "details", "dependencies"]
      }
    },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseName: { type: Type.STRING },
          duration: { type: Type.STRING },
          milestones: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                date: { type: Type.STRING },
                dependency: { type: Type.STRING, description: "ID of a previous milestone or activity this depends on" }
              },
              required: ["id", "title"]
            } 
          }
        },
        required: ["phaseName", "duration", "milestones"]
      }
    },
    activities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          task: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          dependency: { type: Type.STRING },
          status: { type: Type.STRING },
          assignedResources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of resource IDs assigned to this task" }
        },
        required: ["id", "task", "startDate", "endDate", "duration", "status"]
      }
    },
    riskLog: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING },
          mitigation: { type: Type.STRING },
          dependency: { type: Type.STRING, description: "Link to a task/activity ID" }
        },
        required: ["id", "category", "description", "impact", "mitigation"]
      }
    },
    backlog: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          objective: { type: Type.STRING, description: "The business objective or goal of this story" },
          acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of conditions that must be met for the story to be complete" },
          priority: { type: Type.STRING },
          status: { type: Type.STRING },
          estimate: { type: Type.NUMBER },
          type: { type: Type.STRING }
        },
        required: ["id", "title", "description", "priority", "status", "type"]
      }
    },
    sprints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          status: { type: Type.STRING }
        },
        required: ["id", "name", "startDate", "endDate", "status"]
      }
    },
    resources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          email: { type: Type.STRING },
          role: { type: Type.STRING },
          availability: { type: Type.NUMBER }
        },
        required: ["id", "name", "email", "role", "availability"]
      }
    },
    weeklyStatus: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        accomplishments: { type: Type.ARRAY, items: { type: Type.STRING } },
        focusNextWeek: { type: Type.ARRAY, items: { type: Type.STRING } },
        mom: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              date: { type: Type.STRING },
              attendance: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    owner: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ["Open", "Closed"] }
                  },
                  required: ["point", "owner", "deadline", "status"]
                }
              }
            },
            required: ["id", "date", "attendance", "actionPoints"]
          }
        }
      },
      required: ["headline", "accomplishments", "focusNextWeek"]
    }
  },
  required: ["metadata", "summary", "wbs", "hld", "lld", "roadmap", "activities", "riskLog", "backlog", "sprints", "resources", "weeklyStatus"]
};

export async function generateProjectAssets(projectName: string, content: string): Promise<ProjectAssets> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Project Name: ${projectName}\nRequirements Data: ${content}`,
    config: {
      systemInstruction: `You are a Senior PMO Director and Solution Architect at BSSconnects. 
      Your expertise: SDLC and Telecom Infrastructure (BSS/OSS/Core).
      Objective: Assist the PM Team in analyzing project docs to generate high-fidelity assets.
      
      Requirements for BSSconnects output:
      1. HLD/LLD: Focus on system architecture, API integration, and backend synchronization. 
         If Telecom, focus on OCS provisioning, SIM Lifecycle, and real-time balance sync.
      2. WBS: Deconstruct into logical Phases/Sprints compatible with MS Project. Map every task back to a Requirement ID (e.g. Req_01).
      3. Risk Log: Categorize into Technical, Regulatory (KYC/ARCEP), and Operational. 
         Link risks to specific WBS/Activity IDs where possible using the dependency field.
      4. Agile Backlog: Generate a comprehensive backlog of User Stories and Tasks based on the requirements.
      5. Sprints: Propose a set of 2-3 initial sprints (Planned status) to kick off the project.
      6. Professional Tone: Technical formal English.
      5. Metadata: Set Prepared by: Team, Organization: BSSconnects.
      6. Weekly Status: Provide a high-level summary headline, 3-5 key accomplishments from the last week based on the project scope, 3-5 focus areas for the next week, and a list of 1-2 initial Minutes of Meeting (MoM) entries if relevant to the requirements.
      
      Strictly adhere to the JSON responseSchema.`,
      responseMimeType: "application/json",
      responseSchema: ASSET_SCHEMA,
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  const data = JSON.parse(jsonStr);
  return {
    ...data,
    id: crypto.randomUUID(),
    lastUpdated: new Date().toISOString()
  } as ProjectAssets;
}

export async function analyzeExcelDocument(projectName: string, excelData: Record<string, any[]>): Promise<ProjectAssets> {
  const content = Object.entries(excelData)
    .map(([sheetName, rows]) => `Sheet: ${sheetName}\nData: ${JSON.stringify(rows)}`)
    .join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Project Name: ${projectName}\nExcel Data Content:\n${content}`,
    config: {
      systemInstruction: `You are a Senior PMO Director and Solution Architect at BSSconnects. 
      Your expertise: SDLC and Telecom Infrastructure (BSS/OSS/Core).
      Objective: Perform a SUPER ANALYSIS on the provided Excel data which contains multiple sheets.
      
      Requirements for BSSconnects output:
      1. Analyze ALL sheets provided. Some might contain requirements, some might contain schedules, some might contain risks or technical specs.
      2. Synthesize all this information into a cohesive set of PMO assets.
      3. Schedule/Activities: If any sheet looks like a project schedule (Gantt, Task List, Milestone plan), prioritize extracting those tasks accurately. Map columns like "Work Item", "Start Date", "End Date", "Duration", and "Owner" to the activities schema.
      4. HLD/LLD: Focus on system architecture, API integration, and backend synchronization. 
      5. WBS: Deconstruct into logical Phases/Sprints compatible with MS Project. Map every task back to a Requirement ID.
      6. Risk Log: Categorize into Technical, Regulatory (KYC/ARCEP), and Operational. 
      7. Agile Backlog: Generate a comprehensive backlog of User Stories and Tasks.
      8. Sprints: Propose initial sprints.
      9. Weekly Status: Provide a high-level summary headline, accomplishments, focus areas, and synthesized Minutes of Meeting (MoM) from any meeting notes found in the Excel sheets.
      
      Strictly adhere to the JSON responseSchema.`,
      responseMimeType: "application/json",
      responseSchema: ASSET_SCHEMA,
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  const data = JSON.parse(jsonStr);
  return {
    ...data,
    id: crypto.randomUUID(),
    lastUpdated: new Date().toISOString()
  } as ProjectAssets;
}

export async function analyzeWBSFromExcel(projectName: string, excelData: Record<string, any[]>): Promise<WBSItem[]> {
  const content = Object.entries(excelData)
    .map(([sheetName, rows]) => `Sheet: ${sheetName}\nData: ${JSON.stringify(rows)}`)
    .join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Project Name: ${projectName}\nExcel Data Content:\n${content}`,
    config: {
      systemInstruction: `You are a Senior PMO Director and Solution Architect at BSSconnects. 
      Objective: Analyze the provided Excel data and extract a structured Work Breakdown Structure (WBS).
      
      Requirements:
      1. Identify milestones, components, and their specific subtasks.
      2. Map every milestone to a Requirement ID (REQ-XXX) if found, or generate logical ones.
      3. Ensure the output is a flat list of WBS items, where each item has a title and an array of subtasks.
      4. Group related tasks under logical milestones.
      
      Strictly adhere to the JSON responseSchema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            reqId: { type: Type.STRING },
            title: { type: Type.STRING },
            subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "reqId", "title", "subtasks"]
        }
      },
    },
  });

  const jsonStr = response.text?.trim() || '[]';
  return JSON.parse(jsonStr) as WBSItem[];
}
