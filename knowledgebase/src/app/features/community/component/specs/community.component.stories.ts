import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {CommonModule} from '@angular/common';
import {CommunityComponent} from '../community.component';
import {provideRouter} from '@angular/router';
import {MarkdownModule} from 'ngx-markdown';
import {importProvidersFrom} from '@angular/core';
import {testFolders} from './test-data';
import {ModalModule} from 'ngx-bootstrap/modal';

const meta: Meta<CommunityComponent> = {
  title: 'Knowledgebase/Community',
  component: CommunityComponent,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/angular/configure/story-layout
    //layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, CommunityComponent],
    }),
    applicationConfig({
      providers: [
        provideRouter([
          {path: '', component: CommunityComponent},
          {path: '**', redirectTo: ''} // Catch-all route to handle undefined routes
        ]),
        importProvidersFrom(ModalModule.forRoot(), MarkdownModule.forRoot())
      ]
    }),
  ],
};

export default meta;
type Story = StoryObj<CommunityComponent>;

export const Default: Story = {
  args: {
    users: [{id: 1, name: 'user2', password: null, salt: null, secret: null}],
    communitySnippets: [
      {id:1, title: 'Title', content: 'Lorem ipsum', user_id: 1, folder: null, isOwnSnippet: true, isPinned: false, public: true},
    ],
    folders: testFolders,
  }
};
