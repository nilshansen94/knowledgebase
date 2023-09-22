import type {Meta, StoryObj} from '@storybook/angular';
import {moduleMetadata} from '@storybook/angular';
import {CommonModule} from '@angular/common';
import {SnippetComponent} from "../snippet.component";

const meta: Meta<SnippetComponent> = {
  title: 'ccAngularArchitecutre/Snippets',
  component: SnippetComponent,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/angular/configure/story-layout
    //layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, SnippetComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<SnippetComponent>;

export const Default: Story = {
  render: (args: SnippetComponent) => ({
    props: args,
  }),
};
Default.args = {
  snippet: {title: 'Title', content: 'Lorem ipsum'}
};
