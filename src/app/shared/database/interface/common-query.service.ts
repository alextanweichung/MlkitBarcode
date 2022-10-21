import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { DBSQLiteValues, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseService } from 'src/app/services/sqlite/database.service';

@Injectable({
  providedIn: 'root'
})
export class CommonQueryService<T> {

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private _databaseService: DatabaseService
  ) { }

  getAllColumns(object: Object) {
    let ret: string[] = [];
    for (var prop in object) {
      ret.push(prop as string);
    }
    return ret;
  }

  getAllColsWithValue(object: Object) {
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

  getColType(col: Object) {
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

  convertDateFormat(input: Date): Date {
    let output = new Date(input);
    return output;
  }

  convertDateString(input: Date): string {
    return formatDate(input, 'yyyy-MM-dd', this.locale);
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
        `
        SELECT ${sql}
        FROM ${table}
        WHERE ${primaryKey}
      `;
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
          sqlParams += ` ${cols.get(key)},`;
          break;
        case "boolean":
          sqlCols += ` ${key},`;
          sqlParams += ` ${cols.get(key)},`;
          break;
        case "string":
        case "Date":
          sqlCols += ` ${key},`;
          sqlParams += ` '${cols.get(key)}',`;
          break;
      }
    }

    sqlCols = sqlCols.substring(0, sqlCols.length - 1).trimStart();
    sqlParams = sqlParams.substring(0, sqlParams.length - 1).trimStart();

    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string =
        `
        INSERT INTO ${table} (${sqlCols})
        VALUES (${sqlParams})
      `;
      let ret: any = await db.run(sqlcmd);
      return ret;
    }, database)
  }

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
            sql += ` ${key} = ${cols.get(key)},`;
            break;
          case "string":
          case "Date":
            sql += ` ${key} = '${cols.get(key)}',`;
            break;
        }
      }
    }

    sql = sql.substring(0, sql.length - 1).trimStart();
    primaryKey = primaryKey.trimStart();

    return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
      let sqlcmd: string =
        `
        UPDATE ${table}
        SET ${sql}
        WHERE ${primaryKey}
      `;
      console.log("🚀 ~ file: common.service.ts ~ line 132 ~ CommonService ~ returnthis._databaseService.executeQuery<any> ~ sqlcmd", sqlcmd)
      // let ret: any = await db.run(sqlcmd);
      // return ret;
    }, database)
  }

  delete() {

  }

}
