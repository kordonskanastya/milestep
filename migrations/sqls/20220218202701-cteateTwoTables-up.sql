create table users(
    id int primary key generated always as identity,
    firstName varchar(100) not null,
    lastName varchar(100) not null,
    email varchar(100) unique not null,
    password varchar(1000) not null,
    interests varchar(100),
    job varchar(100),
    university_degree varchar(100),
    description varchar(255)
);

create table events(
    id int primary key generated always as identity,
    title varchar(100) not null,
    text varchar(100) not null,
    date date not null,
    time time not null,
    deleted bool DEFAULT false,
    fk_user_id int references users(id)
);
