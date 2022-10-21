
import { SQLiteService } from './sqlite.service';

import { Injectable } from '@angular/core';
import { MigrationService } from './migration.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class InitializeAppService {

  constructor(
    private sqliteService: SQLiteService,
    private configService: ConfigService,
    private migrationService: MigrationService) { }

  async initializeApp() {
    await this.sqliteService.initializePlugin().then(async (ret) => {
      try {
        //execute startup queries
        // await this.migrationService.migrate();
        await this.configService.load();
      } catch (error) {
        throw Error(`initializeAppError: ${error}`);
      }

    });
  }

}
