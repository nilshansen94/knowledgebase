import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {RegistrationComponent} from '../component/registration.component';

export default {
  title: 'Features/Registration',
  component: RegistrationComponent,
  decorators: [
    applicationConfig({
      providers: []
    }),
    moduleMetadata({
      declarations: [],
      imports: [
        RegistrationComponent
      ],
    })
  ]
} as Meta<RegistrationComponent>;

type Story = StoryObj<RegistrationComponent>;

export const Default: Story = {
  args: {
    isValid: true,
    errorMessage: '',
  }
};

export const Invalid: Story = {
  args: {
    isValid: false,
    errorMessage: 'Username is already taken',
  }
}
