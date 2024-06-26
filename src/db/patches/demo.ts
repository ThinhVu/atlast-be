import semver from 'semver';
import {IPatch} from "./patch";

const demo: IPatch = {
   patchId: 'demo@v1',
   shouldRun: (currentVersion: string) => semver.lte(currentVersion, '0.0.1'),
   alwaysRun: false,
   async run() {
      console.log('Migrate db');
      console.log('Db migrated!');
   }
}

export default demo
