import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";

/**
 * Sanitizes a message array so it's safe to send to Codestral / Mistral APIs.
 *
 * Rules enforced:
 *  1. After the system message the first message must be a HumanMessage.
 *  2. ToolMessages must always be preceded by an AIMessage that contains tool_calls.
 *  3. We strip any leading ToolMessages / AIMessages from the slice so the
 *     sequence always starts with a HumanMessage.
 *
 * @param messages  The raw state.messages (or a slice thereof)
 * @param maxTail   How many recent messages to keep (before sanitizing). Default 10.
 */
export function sanitizeMessages(messages: BaseMessage[], maxTail = 10): BaseMessage[] {
    // Always keep at least the first HumanMessage (the user request)
    const original = messages[0];
    const tail = messages.slice(-maxTail);

    // Find the first HumanMessage in the tail to start a valid sequence
    const firstHumanIdx = tail.findIndex((m) => m._getType() === "human");

    let slice: BaseMessage[];
    if (firstHumanIdx === -1) {
        // No HumanMessage in tail – fall back to just the original user message
        slice = original ? [original] : [];
    } else {
        slice = tail.slice(firstHumanIdx);
    }

    // Validate that every ToolMessage is preceded by an AIMessage with tool_calls.
    // Drop any ToolMessage that appears without a valid preceding AIMessage.
    const validated: BaseMessage[] = [];
    for (let i = 0; i < slice.length; i++) {
        const msg: BaseMessage = slice[i] as BaseMessage;
        if (msg._getType() === "tool") {
            const prev: BaseMessage | undefined = validated[validated.length - 1];
            if (!prev || prev._getType() !== "ai" || !(prev as AIMessage).tool_calls?.length) {
                // Orphaned tool message – skip it
                continue;
            }
        }
        validated.push(msg);
    }

    return validated;
}
