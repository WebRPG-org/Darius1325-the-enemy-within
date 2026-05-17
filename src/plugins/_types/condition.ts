// ----------------------

import { ConditionId, ConditionRemoval } from "./enum";

// File: condition.ts
// Author: Ersokili, 7evy, Sebibebi67
// Date: 25/03/2026
// Description: Conditions are stackable status effects applied during combat and exploration.
// Reference: WFRP4e Core Rulebook p.167

// ----------------------

export type Condition = {
    id: ConditionId;
    name: string;
    /** Verb used to describe damage in battle */
    message?: string;
    /** Description shown in the UI */
    description: string;
    /** Icon index from the RMMV icon sheet */
    icon?: number;
    /**
     * Maximum number of times this condition can be applied to a battler
     * Use 1 for binary conditions (Prone, Surprised, Unconscious)
     * Use Infinity for freely stackable ones (Bleeding)
     */
    maxStacks: number;

    testModifier?: {
        mod: number,
        comps?: string[],
    };

    /** A condition can be removed on turn start, by succeeding a test, by active healing or by resting */
    removal: ConditionRemoval;
    removalTest?: {
        comp: string;
    };
    fatiguedOnRemoval?: boolean;
    proneOnRemoval?: boolean;

    blocksMovement?: boolean;
    halvesMovement?: boolean;
    blocksAction?: boolean;

    damageOverTime?: boolean;
};
