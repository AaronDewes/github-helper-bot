declare module 'parse-reminder' {
    /**
    * A parsed reminder
    */
    export interface parsedReminder {
        /**
        * Who should be reminded
        * @type {string}
        */
        who: string;
        /**
        * Of what should be reminded
        * @type {string}
        */
        what: string;
        /**
        * When should be reminded
        * @type {Date}
        */
        when: Date;
    }

    /**
    * Parses a command to remind of something
    * @param {string} input The time after which should be reminded
    * @param {string} from When the time in input starts
    * @returns {parsedReminder} The reminder parsed into an Object
    */
    function parseReminder(input: string, from: string): parsedReminder;

    export default parseReminder;
}
