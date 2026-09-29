export interface WorkspaceSampleAvatar {
  id: string;
  publicId: string;
  url: string;
}

export const WORKSPACE_SAMPLE_AVATAR_FOLDER = 'icons';

const avatarIds = [
  'workspace',
  'desk',
  'workstation',
  'coworking',
  'table',
  'checklist',
  'folders',
  'arrangement',
  'coffee',
  'math',
] as const;

export const WORKSPACE_SAMPLE_AVATARS: WorkspaceSampleAvatar[] = avatarIds.map(
  id => ({
    id,
    publicId: `${WORKSPACE_SAMPLE_AVATAR_FOLDER}/${id}`,
    url: `/icons/${id}.png`,
  }),
);

const workspaceSampleAvatarUrls = new Set(
  WORKSPACE_SAMPLE_AVATARS.map(avatar => avatar.url),
);

export const isWorkspaceSampleAvatar = (
  avatar?: string | null,
): avatar is string => Boolean(avatar && workspaceSampleAvatarUrls.has(avatar));

export const isLegacyCloudinaryAvatar = (
  avatar?: string | null,
): boolean => Boolean(avatar && avatar.includes('cloudinary.com'));

export const DEFAULT_WORKSPACE_AVATAR = WORKSPACE_SAMPLE_AVATARS[0].url;

export const pickRandomWorkspaceAvatar = (
  random: () => number = Math.random,
): string => {
  const index = Math.min(
    Math.floor(random() * WORKSPACE_SAMPLE_AVATARS.length),
    WORKSPACE_SAMPLE_AVATARS.length - 1,
  );
  return WORKSPACE_SAMPLE_AVATARS[index].url;
};
