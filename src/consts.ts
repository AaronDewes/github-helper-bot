import { config } from 'dotenv';
config();

export const allowedRepoOwners = (process.env.ALLOWED_REPO_OWNERS && JSON.parse(process.env.ALLOWED_REPO_OWNERS)) || [
    'getumbrel',
    'UmbrelBuilds',
    'AaronDewes',
    'louneskmt',
    'lukechilds',
    'mayankchhabra',
];

export const buildOrg = process.env.BUILD_ORG || 'UmbrelBuilds';

export const pushToken = process.env.GH_PUSH_TOKEN;

export const version = '0.0.1-alpha.5';

export const configVersion = 0;
