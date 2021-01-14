create table area (
  id varchar(255) primary key,
  "areaName" varchar(255) not null,
  "totalShots" int not null
);

create table administration (
  id varchar(255) not null,
  "areaId" varchar(255) not null,
  date timestamp not null,
  shots int not null,
  constraint fk_area
    foreign key ("areaId") references area(id)
);
