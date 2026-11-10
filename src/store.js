// Tiny in-memory store: lets "Preview as a friend" play the quiz you're still building.
let draft = null;
export const setDraft = (d) => { draft = d; };
export const getDraft = () => draft;
