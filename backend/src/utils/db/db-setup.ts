import {Folder, KbUser, Snippet, UsrFoldSnip} from './db-models';

export async function setupDb(): Promise<void> {
  // todo use sequelize.sync();
  await KbUser.sync();
  await Snippet.sync();
  await Folder.sync();
  await UsrFoldSnip.sync();
}
