export interface WorkspaceAvatarSource {
  _id?: string;
  avatar?: string | null;
  name?: string | null;
  key?: string | null;
}

export interface WorkspaceSampleAvatar {
  id: string;
  publicId: string;
  url: string;
}

// Matches backend DEFAULT_WORKSPACE_AVATAR (WORKSPACE_SAMPLE_AVATARS[0])
export const DEFAULT_WORKSPACE_AVATAR_URL = "/icons/workspace.png";

export const DEFAULT_WORKSPACE_SAMPLE_AVATARS: WorkspaceSampleAvatar[] = [
  "workspace",
  "desk",
  "workstation",
  "coworking",
  "table",
  "checklist",
  "folders",
  "arrangement",
  "coffee",
  "math",
].map((id) => ({
  id,
  publicId: `icons/${id}`,
  url: `/icons/${id}.png`,
}));

export const isLegacyCloudinaryAvatar = (avatar?: string | null): boolean =>
  Boolean(avatar && avatar.includes("cloudinary.com"));

export const getWorkspaceAvatarUrl = (workspace?: WorkspaceAvatarSource | null) => {
  if (!workspace?.avatar || isLegacyCloudinaryAvatar(workspace.avatar)) {
    return DEFAULT_WORKSPACE_AVATAR_URL;
  }
  return workspace.avatar;
};

export const getWorkspaceAvatarInitial = (workspace?: WorkspaceAvatarSource | null) =>
  (workspace?.name?.trim().charAt(0) || workspace?.key?.trim().charAt(0) || "W").toUpperCase();

export const selectRandomWorkspaceAvatar = (
  avatars: WorkspaceSampleAvatar[],
  random: () => number = Math.random,
) => {
  if (avatars.length === 0) return DEFAULT_WORKSPACE_AVATAR_URL;
  const index = Math.min(Math.floor(random() * avatars.length), avatars.length - 1);
  return avatars[index].url;
};

export const updateWorkspaceAvatarInList = <T extends WorkspaceAvatarSource>(
  workspaces: T[],
  workspaceId: string,
  avatar: string,
) =>
  workspaces.map((workspace) =>
    workspace._id === workspaceId ? ({ ...workspace, avatar } as T) : workspace,
  );
