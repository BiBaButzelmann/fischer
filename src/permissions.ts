import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
    project: [
        "adminpanel:view",
        "tournament:read",
        "tournament:create",
        "tournament:update",
        "tournament:delete",
        "tournament:start",
        "tournament:end",
        "game:read",
        "game:write",
        "game:update",
        "game:delete",
        "participant:read",
        "participant:create",
        "participant:update",
        "participant:delete",
    ],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    project: [
        "tournament:read",
        "game:read",
        "game:update",
        "participant:read",
    ],
});

// TODO: allow to ban participants
export const admin = ac.newRole({
    project: [
        "adminpanel:view",
        "tournament:read",
        "tournament:create",
        "tournament:update",
        "tournament:delete",
        "tournament:start",
        "tournament:end",
        "game:read",
        "game:write",
        "game:update",
        "game:delete",
        "participant:read",
        "participant:create",
        "participant:update",
        "participant:delete",
    ],
});
