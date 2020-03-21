"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const git_last_commit_1 = require("git-last-commit");
const child_process_1 = require("child_process");
const chalk = require("chalk");
function getGitCommit() {
    return new Promise((resolve, reject) => {
        git_last_commit_1.getLastCommit((err, commit) => {
            if (err)
                reject(err);
            else {
                commit.time = child_process_1.execSync('git log -1 --format=%cd --date=local').toString().trim();
                resolve(commit);
            }
        });
    });
}
exports.getGitCommit = getGitCommit;
function logVersionDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        let commit = yield getGitCommit();
        let commitDate = new Date(commit.time);
        console.log(`Running commit ${chalk.blueBright(commit.shortHash)} ${chalk.gray(`(${commit.subject})`)}`);
        console.log(`From ${chalk.blueBright(commitDate.toLocaleString())}`);
    });
}
exports.logVersionDetails = logVersionDetails;
//# sourceMappingURL=gitParser.js.map