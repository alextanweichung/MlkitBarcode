import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseService } from 'src/app/services/sqlite/database.service';
import { create_item_barcode_table, create_item_master_table } from 'src/app/services/sqlite/migration.service';
import { SQLiteService } from 'src/app/services/sqlite/sqlite.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { dbConfig, inboundDb_Tables } from '../config/db-config';

@Injectable({
  providedIn: 'root'
})
export class CommonQueryService<T> {

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private _databaseService: DatabaseService,
    private http: HttpClient,
    private sqlite: SQLiteService,
    private toastService: ToastService,
  ) { }

  private getAllColumns(object: Object) {
    let ret: Map<string, Object> = new Map<string, Object>();
    for (var prop in object) {
      ret.set(prop, object[prop]);
    }
    return ret;
  }

  private getAllColsWithValue(object: Object) {
    let ret: Map<string, Object> = new Map<string, Object>();
    for (var prop in object) {
      if (this.getColType(object[prop]) === "Date") {
        ret.set(prop, this.convertDateString(object[prop]));
      } else if (this.getColType(object[prop]) === "boolean") {
        ret.set(prop, object[prop] ? 1 : 0);
      } else {
        ret.set(prop, object[prop]);
      }
    }
    return ret;
  }

  private getColType(col: Object) {
    if (typeof col === 'object') {
      if (Object.prototype.toString.call(col) === "[object Date]") {
        return "Date";
      } else {
        return "Unknown";
      }
    } else {
      return typeof col;
    }
  }

  private convertDateFormat(input: Date): Date {
    let output = new Date(input);
    return output;
  }

  private convertDateString(input: Date): string {
    return formatDate(input, 'yyyy-MM-dd hh:mm:ss', this.locale);
  }

  load(object, table, database) {
    let cols = this.getAllColsWithValue(object);
    let sql = '';
    let primaryKey = '';

    for (const key of cols.keys()) {
      if (key.toLowerCase() === (table.toLowerCase() + "id")) {
        primaryKey += ` ${key} = ${cols.get(key)}`;
      } else {
        sql += ` ${key},`;
      }
    }

    sql = sql.substring(0, sql.length - 1).trimStart();
    primaryKey = primaryKey.trimStart();

    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string =
        `SELECT * FROM ${table} `;
      let ret: DBSQLiteValues = await db.query(sqlcmd);
      if (ret.values.length > 0) {
        return ret.values[0] as Object
      }
      return null;
    }, database)
  }

  insert(object, table, database) {
    let cols = this.getAllColsWithValue(object);
    let sqlCols = '';
    let sqlParams = '';

    for (const key of cols.keys()) {
      switch (this.getColType(cols.get(key))) {
        case "number":
          sqlCols += ` ${key},`;
          sqlParams += `${cols.get(key)},`;
          break;
        case "boolean":
          sqlCols += ` ${key},`;
          sqlParams += `${cols.get(key)},`;
          break;
        case "string":
        case "Date":
          sqlCols += ` ${key},`;
          sqlParams += `'${cols.get(key)}',`;
          break;
      }
    }

    sqlCols = sqlCols.substring(0, sqlCols.length - 1).trimStart();
    sqlParams = sqlParams.substring(0, sqlParams.length - 1).trimStart();

    
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string =
        `INSERT INTO ${table} (${sqlCols}) VALUES (${sqlParams})`;
      let ret: any = await db.run(sqlcmd);
      return ret;
    }, database)
  }

  async bulkInsert(objects, table, database) {
    const statements = [];
    if (objects.length > 0) {
      objects.forEach(i => {
        let cols = this.getAllColsWithValue(i);
        let sqlCols = '';
        let sqltest = '';
        let sqlParams = '';

        for (const key of cols.keys()) {
          switch (this.getColType(cols.get(key))) {
            case "number":
              sqlCols += ` ${key},`;
              sqltest += '?,';
              sqlParams += `${cols.get(key)},`;
              break;
            case "boolean":
              sqlCols += ` ${key},`;
              sqltest += '?,';
              sqlParams += `${cols.get(key)},`;
              break;
            case "string":
            case "Date":
              sqlCols += ` ${key},`;
              sqltest += '?,';
              sqlParams += `${cols.get(key)},`;
              break;
          }
        }
        sqlCols = sqlCols.substring(0, sqlCols.length - 1).trimStart();
        sqltest = sqltest.substring(0, sqltest.length - 1).trimStart();
        sqlParams = sqlParams.substring(0, sqlParams.length - 1).trimStart();

        statements.push({
          statement: `INSERT INTO ${table} ` + `(` + sqlCols + `) VALUES (` + sqltest + `);`,
          values: [
            sqlParams.split(',')
          ]
        })
      });

      await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
        let ret: any = await db.executeSet(statements, true);
      }, database)
    }
  }

  selectAll(table, database) {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string =
        `SELECT * FROM ${table}`;
      let ret: DBSQLiteValues = await db.query(sqlcmd);
      if (ret.values.length > 0) {
        return ret.values as Object
      }
      return null;
    }, database)
  }

  /* #region  update */

  update(object, table, database) {
    let cols = this.getAllColsWithValue(object);
    let sql = '';
    let primaryKey = '';

    for (const key of cols.keys()) {
      if (key.toLowerCase() === (table.toLowerCase() + "id")) {
        primaryKey += ` ${key} = ${cols.get(key)}`;
      } else {
        switch (this.getColType(cols.get(key))) {
          case "number":
          case "boolean":
            sql += `${key} = ${cols.get(key)},`;
            break;
          case "string":
          case "Date":
            sql += `${key} = '${cols.get(key)}',`;
            break;
        }
      }
    }

    sql = sql.substring(0, sql.length - 1).trimStart();
    primaryKey = primaryKey.trimStart();

    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string = `UPDATE ${table} SET ${sql} WHERE ${primaryKey}`;
      let ret: any = await db.run(sqlcmd);
      return ret;
    }, database)
  }

  /* #endregion */

  deleteAll(table, database) {
    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string =
        `DELETE FROM ${table} `;
      let ret: any = await db.run(sqlcmd);
      return ret;
    }, database)
  }

  /* #region  inbound */

  async syncInboundData(table, objects) {
    const statements = [];

    // drop table
    statements.push({
      statement: `DROP TABLE IF EXISTS ${table}`,
      values: []
    })

    // insert table
    switch (table) {
      case inboundDb_Tables.item_Master:
        statements.push({
          statement: create_item_master_table,
          values: []
        })
        break;
      case inboundDb_Tables.item_Barcode:
        statements.push({
          statement: create_item_barcode_table,
          values: []
        })
        break;
    }

    if (objects.length > 0) {
      let cols = this.getAllColumns(objects[0]);
      let sqlCols = '';
      let sqlQMarks = '';

      for (const key of cols.keys()) {
        switch (this.getColType(cols.get(key))) {
          case "number":
            sqlCols += ` ${key},`;
            sqlQMarks += '?,';
            break;
          case "boolean":
            sqlCols += ` ${key},`;
            sqlQMarks += '?,';
            break;
          case "string":
          case "Date":
            sqlCols += ` ${key},`;
            sqlQMarks += '?,';
            break;
          default:
            sqlCols += ` ${key},`;
            sqlQMarks += '?,';
            break;
        }
      }

      sqlCols = sqlCols.substring(0, sqlCols.length - 1).trimStart();
      sqlQMarks = sqlQMarks.substring(0, sqlQMarks.length - 1).trimStart();

      statements.push({
        statement: `INSERT INTO ${table} ` + `(` + sqlCols + `) VALUES (` + sqlQMarks + `);`,
        values: []
      })
      
      objects.forEach(i => {
        let cols = this.getAllColsWithValue(i);
        let sqlParams = '';

        for (const key of cols.keys()) {
          switch (this.getColType(cols.get(key))) {
            case "number":
              sqlParams += `${cols.get(key)},`;
              break;
            case "boolean":
              sqlParams += `${cols.get(key)},`;
              break;
            case "string":
            case "Date":
              sqlParams += `${cols.get(key)},`;
              break;
            default:
              sqlParams += `,`;
              break;
          }
        }
        sqlParams = sqlParams.substring(0, sqlParams.length - 1).trimStart();

        statements[2].values.push(
          sqlParams.split(',')
        )
      });
      statements.push({
        statement: `CREATE UNIQUE INDEX ${table}_id_UNIQUE ON ${table} (id ASC);`,
        values: []
      })
      console.log("🚀 ~ file: common-query.service.ts:300 ~ CommonQueryService<T> ~ syncInboundData ~ statements", JSON.stringify(statements))
      let timestart = new Date();
      await this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
        let ret: any = await db.executeSet(statements, true);
      }, dbConfig.inbounddb)
      console.log(new Date());
      let timeend = new Date();
      this.toastService.presentToast(`table ${table}`, (timeend.getTime() - timestart.getTime()).toString(), 'top', 'success', 1000);
    }
  }

  /* #endregion */

}
