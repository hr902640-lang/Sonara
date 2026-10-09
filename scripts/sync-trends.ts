import { syncTrends } from "../lib/sync";
syncTrends().then(report => { console.table(report); }).catch(error => { console.error(error); process.exitCode = 1; });
