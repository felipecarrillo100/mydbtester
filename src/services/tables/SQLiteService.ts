import {capSQLiteSet, DBSQLiteValues, SQLiteDBConnection} from "@capacitor-community/sqlite/dist/esm/definitions";

interface StandardQuery {
    search?: string;
    offset: number;
    limit: number;
    sortBy?: string;
    asc?: boolean;
}

interface StandardListResult<AType> {
    matches: number,
    total: number,
    items: AType[],
}

class SQLiteService<SomeType> {
    protected getTableDefinition() { return ""};
    protected getTableName() { return ""};
    protected getId() { return  "id" };
    protected getColumns() {return [] as string[]};
    protected getSearchableColumns() {return this.getColumns()};

    private db: SQLiteDBConnection;

    constructor(db:SQLiteDBConnection) {
        this.db = db;
    }

    public createTable() {
        const sql = this.getTableDefinition();
        return new Promise<boolean>((resolve => {
            this.db.query(sql).then((result: DBSQLiteValues)=>{
                console.log(result);
                if (result)
                resolve(true);
            }).catch((err)=>{
                console.log(err);
                resolve(false);
            });
        }));
    }

    public  tableExists(name: string) {
        const tableExists = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + this.getTableName() +"'";

        return new Promise<boolean>((resolve => {
            this.db.query(tableExists).then((result: DBSQLiteValues)=>{
                let exists: boolean = false;
                if (result.values && result.values.length > 0 ) {
                    if (result.values[0].name = this.getTableName() ) {
                        exists = true;
                    }
                }
                resolve(exists);
            }).catch(()=>{
                resolve(false);
            });
        }));
    }

    public  dropTable(name: string) {
        const dropTable = "DROP TABLE IF EXISTS " + this.getTableName();
        return new Promise<boolean>((resolve => {
            this.db.query(dropTable).then((values)=>{
                console.log(values);
                resolve(true);
            }).catch(()=>{
                resolve(false);
            });
        }));
    }


    public add(item: SomeType){
        const columns = this.getColumns();
        const columnsCSVStr = columns.join(",");
        const valuesQmarkCSV = columns.map((col)=>{
            // @ts-ignore
            return '?';
        }).join(",");
        const valuesArray = columns.map((col)=>{
            // @ts-ignore
            return item[col];
        });
        const sql = "INSERT INTO " + this.getTableName() + " ("+ columnsCSVStr +")" + " VALUES (" + valuesQmarkCSV + ")" ;

        return new Promise<SomeType | null>((resolve => {
            this.db.executeSet([{statement: sql, values: valuesArray}]).then((result)=>{
                let item2: SomeType | null = null;
                if (result && result.changes && result.changes.changes === 1 && typeof result.changes.lastId!== "undefined"){
                    const newId = Number(result.changes.lastId);
                    item2 = {...item};
                    // @ts-ignore
                    item2[this.getId()]  = newId;
                    resolve(item2);
                }
            }).catch((err)=>{
                resolve(null);
            });
        }));
    };



    public put(id: number, item: SomeType)  {
        const columns = this.getColumns();
        const varSet = columns.map((col)=>{
            // @ts-ignore
            return col +'=?';
        }).join(",");
        const valuesArray = columns.map((col)=>{
            // @ts-ignore
            return item[col];
        });
        const sql = "UPDATE " + this.getTableName() + " SET " + varSet + " WHERE " + this.getId() + "=?";
        valuesArray.push(id);

        return new Promise<SomeType | null>((resolve => {
            this.db.executeSet([{statement: sql, values: valuesArray}]).then((values)=>{
                let item2: SomeType | null = null;
                item2 = {...item};
                // @ts-ignore
                item2[this.getId()]  = id;
                resolve(item2);
            }).catch((err)=>{
                resolve(null);
            });
        }));
    };

    public get(id: number) {
        const sql = "SELECT * FROM "+ this.getTableName() + " WHERE " + this.getId() + "= ?" ;
        return new Promise<SomeType | null>((resolve => {
            this.db.query(sql, [id]).then((result: DBSQLiteValues)=>{
                let item: SomeType | null = null;
                if (result && result.values && result.values.length > 0) item = result.values[0];
                resolve(item);
            }).catch(()=>{
                resolve(null);
            });
        }));
    };

    public delete(id: number) {
        const sql = "DELETE FROM "+ this.getTableName() + " WHERE " + this.getId() + "= ?"  ;
        return new Promise<boolean>((resolve => {
            this.db.query(sql, [id]).then(()=>{
                resolve(true);
            }).catch(()=>{
                resolve(false);
            });
        }));
    };

    private executeSet(s: any) {

    }

    public list(query: StandardQuery) {
        const searchText = query.search ? query.search : "";
        const sortBy = query.sortBy ? query.sortBy : this.getId();
        const columnsSearchable = this.getSearchableColumns();
        const conditionsCSV = columnsSearchable.map((col) => col+" LIKE ?").join(" or ");
        const valuesConditions = columnsSearchable.map(() => "%" + searchText + "%");

        const sql = "SELECT * FROM "+ this.getTableName()  + " WHERE " + conditionsCSV + " ORDER BY ? " +(query.asc ? "ASC" : "DESC") + " LIMIT ? OFFSET ?" ;
        const sqlUnlimited = "SELECT COUNT(*) FROM "+ this.getTableName()  + " WHERE " + conditionsCSV ;

        const sortLimitValues = [sortBy, query.limit, query.offset];
        const sqlTotal = "SELECT COUNT(*) FROM "+ this.getTableName();

        const valuesTotal = [...valuesConditions,...sortLimitValues];
        const result: StandardListResult<SomeType> =  {
            matches: 0,
            total: 0,
            items: [] as SomeType[] ,
        };
        return new Promise<StandardListResult<SomeType>>((resolve => {
            this.db.query(sql, valuesTotal).then((values)=>{
                result.matches = values.values ? values.values.length : 0;
                result.items = values.values ? values.values : [];
                this.db.query(sqlUnlimited, valuesConditions).then((valuesUnlimited)=>{
                    if (valuesUnlimited.values) {
                        const count = valuesUnlimited.values[0]["COUNT(*)"];
                        result.matches = count;
                        this.db.query(sqlTotal).then((valuesTotal)=>{
                            if (valuesTotal.values) {
                                const count = valuesTotal.values[0]["COUNT(*)"];
                                result.total = count;
                                resolve(result);
                            }
                        })
                    }
                })
            }).catch((err)=>{
                resolve(result);
            });
        }));
    }
}

export {
    SQLiteService
}
