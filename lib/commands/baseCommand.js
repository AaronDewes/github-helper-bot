"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
class BaseCommand {
    static run(_context, _args, _isPR) {
        throw new Error("A command didn't implement the run fuction!");
    }
}
exports.BaseCommand = BaseCommand;
BaseCommand.helptext = 'description';
