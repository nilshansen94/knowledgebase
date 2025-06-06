import type {Meta, StoryObj} from '@storybook/angular';
import {moduleMetadata} from '@storybook/angular';
import {CommonModule} from '@angular/common';
import {SnippetComponent} from '../snippet.component';
import {ModalModule} from 'ngx-bootstrap/modal';
import {MarkdownModule} from 'ngx-markdown';

const meta: Meta<SnippetComponent> = {
  title: 'Knowledgebase/Snippets',
  component: SnippetComponent,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/angular/configure/story-layout
    //layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, SnippetComponent, ModalModule, MarkdownModule.forRoot()],
    }),
  ],
};

export default meta;
type Story = StoryObj<SnippetComponent>;

export const Default: Story = {
  args: {
    snippet: {id:1, title: 'Title', content: 'Lorem ipsum', user_id: 1, folder: null, isOwnSnippet: true, isPinned: false, public: true},
  }
};
