import { screen } from '@testing-library/react';
import { TestRenderer } from '../../../../utils/testRenderer';
import Error from '../Error';

describe('<Error />', () => {
  test('should render provided hints', () => {
    const error = {
      message: 'Hi there!',
      hints: ['hint#01', 'hint#02', 'hint#03'],
    };
    TestRenderer(<Error error={error} />);

    expect(screen.getByText(error.message)).toBeInTheDocument();
    error.hints.map((h) => {
      expect(screen.getByText(h)).toBeInTheDocument();
    });
  });
});
