CREATE TABLE "group_match_entering_helper" (
	"group_id" integer NOT NULL,
	"match_entering_helper_id" integer NOT NULL,
	CONSTRAINT "group_match_entering_helper_group_id_match_entering_helper_id_pk" PRIMARY KEY("group_id","match_entering_helper_id")
);
