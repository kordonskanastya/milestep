create table joinevents(
    id int references events(id),
    fk_user_id int references users(id)
);
