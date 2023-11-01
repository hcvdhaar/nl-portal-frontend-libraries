import React, {ReactElement} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {MockedProvider} from '@apollo/client/testing';
import {gql} from '@apollo/client';
import {LocalizationProvider} from '@nl-portal/nl-portal-localization';
import {UserInformationProvider} from '../../providers';
import {EditAccountPage} from './edit-account-page';

const MockEditAccountPage = (): ReactElement => {
  const route = '/account/aanpassen?prop=telefoonnummer';

  const EXAMPLE_QUERY = gql`
    mutation SubmitTask($id: UUID!, $submission: JSON!) {
      submitTask(id: $id, submission: $submission) {
        id
        objectId
        formId
        title
        status
        date
      }
    }
  `;

  const mocks = [
    {
      request: {
        query: EXAMPLE_QUERY,
        variables: {
          name: 'Test',
        },
      },
      result: {
        data: {
          task: {id: '1', name: 'Informatie aanvraag', zaakId: '23jfdi45-2345-2345-jf45k323oi12'},
        },
      },
    },
  ];

  return (
    <LocalizationProvider>
      <UserInformationProvider>
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter initialEntries={[route]}>
            <EditAccountPage />
          </MemoryRouter>
        </MockedProvider>
      </UserInformationProvider>
    </LocalizationProvider>
  );
};

describe('EditAccountPage', () => {
  const errorText = 'a valid phone number consists of 10 digits';
  const inputField = () => screen.getByRole('textbox');
  const errorTextP = () => screen.queryByText(errorText);
  const saveButton = () => screen.getByText('Save');

  beforeEach(() => {
    render(MockEditAccountPage());
  });

  it('should have a disabled save button if nothing is entered', () => {
    expect(saveButton().closest('button')).toBeDisabled();
  });

  it('should give an error msg when tekst is entered as a phone number', () => {
    expect(errorTextP()).toBeNull();

    expect(inputField()).not.toBeNull();

    fireEvent.change(inputField(), {target: {value: 'hoiDitIsNietGeldig'}});

    expect(errorTextP()).toBeVisible();
    expect(saveButton().closest('button')).toBeDisabled();
  });

  it('should give an error msg when too many number are entered', () => {
    expect(errorTextP()).toBeNull();

    expect(inputField()).not.toBeNull();

    fireEvent.change(inputField(), {target: {value: '12345678910'}});

    expect(errorTextP()).not.toBeNull();
    expect(errorTextP()?.tagName).toEqual('P');
    expect(saveButton().closest('button')).toBeDisabled();
  });

  it('should not give an error msg when 10 numbers are entered', () => {
    expect(errorTextP()).toBeNull();

    expect(inputField()).not.toBeNull();

    fireEvent.change(inputField(), {target: {value: '0123456789'}});

    expect(errorTextP()).toBeNull();
    expect(saveButton().closest('button')).toBeEnabled();
  });

  it('should give an error msg when a special character is entered', () => {
    expect(errorTextP()).toBeNull();

    expect(inputField()).not.toBeNull();

    fireEvent.change(inputField(), {target: {value: '-012345678'}});

    expect(errorTextP()).not.toBeNull();
    expect(saveButton().closest('button')).toBeDisabled();
  });
});
