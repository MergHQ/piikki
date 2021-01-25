import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: 4,
})

export const createTables = (load?: boolean) =>
  pool.connect().then(async con => {
    try {
      con.query(`
      create table if not exists area${load ? '_load' : ''} (
        id varchar(255) primary key,
        "areaName" varchar(255) not null,
        "totalShots" int not null
      );

      create table if not exists administration${load ? '_load' : ''} (
        id varchar(255) not null,
        "areaId" varchar(255) not null,
        date timestamp not null,
        shots int not null,
        constraint fk_area
          foreign key ("areaId") references area${load ? '_load' : ''}(id)
      );
      `)
    } catch (e) {
      throw e
    } finally {
      con.release()
    }
  })

export const getClient = () => pool.connect()
