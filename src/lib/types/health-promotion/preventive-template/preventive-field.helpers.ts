import type { PreventiveFieldType } from "../../../../../generated/prisma/enums";

export function fieldTypeSupportsOptions(type: PreventiveFieldType) {
    return ["SELECT", "SINGLE_SELECT", "MULTI_SELECT", "RADIO", "CHECKBOX_GROUP"].includes(
        String(type)
    );
}

export function fieldTypeAllowsMultipleValues(type: PreventiveFieldType) {
    return ["MULTI_SELECT", "CHECKBOX_GROUP"].includes(String(type));
}