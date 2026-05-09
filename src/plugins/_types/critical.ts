export type Critical = {
    name: string;
    
    /**
     * Dice rolls triggering this critical effect.
     * Both min and max are inclusive.
     */
    interval: {
        min : number;
        max : number;
    }

    /**
     * TODO
     */
    effect: {

    }

    /**
     * Message to display on hit
     */
    message : string;
};
