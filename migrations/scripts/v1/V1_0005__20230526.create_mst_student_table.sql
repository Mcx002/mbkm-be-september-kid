drop table if exists public.mst_student;
create table public.mst_student
(
    id               integer generated by default as identity
        constraint mst_student_pk
            primary key,
    nim              varchar(12)                            not null,
    name             varchar(100)                           not null,
    email            varchar(100)                           not null,
    study_program_id integer                                not null
        constraint mst_student_mst_study_program_id_fk
            references public.mst_study_program
            on update cascade on delete cascade,
    created_at       timestamp(6) default CURRENT_TIMESTAMP not null,
    updated_at       timestamp(6),
    deleted_at       timestamp(6)
);

alter table public.mst_student
    owner to postgres;

create unique index mst_student_email_uindex
    on public.mst_student (email);

create unique index mst_student_nim_uindex
    on public.mst_student (nim);

