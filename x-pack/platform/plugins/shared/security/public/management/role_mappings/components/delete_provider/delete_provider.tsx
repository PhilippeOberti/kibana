/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiConfirmModal, useGeneratedHtmlId } from '@elastic/eui';
import type { ReactElement } from 'react';
import React, { Fragment, useRef, useState } from 'react';

import type { NotificationsStart } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';
import type { PublicMethodsOf } from '@kbn/utility-types';

import type { RoleMapping } from '../../../../../common';
import type { RoleMappingsAPIClient } from '../../role_mappings_api_client';

interface Props {
  roleMappingsAPI: PublicMethodsOf<RoleMappingsAPIClient>;
  notifications: NotificationsStart;
  children: (deleteMappings: DeleteRoleMappings) => ReactElement;
}

export type DeleteRoleMappings = (
  roleMappings: RoleMapping[],
  onSuccess?: OnSuccessCallback,
  onCancel?: OnCancelCallback
) => void;

type OnSuccessCallback = (deletedRoleMappings: string[]) => void;
type OnCancelCallback = () => void;

export const DeleteProvider: React.FunctionComponent<Props> = ({
  roleMappingsAPI,
  children,
  notifications,
}) => {
  const confirmModalTitleId = useGeneratedHtmlId();

  const [roleMappings, setRoleMappings] = useState<RoleMapping[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);

  const onSuccessCallback = useRef<OnSuccessCallback | null>(null);
  const onCancelCallback = useRef<OnCancelCallback | null>(null);

  const deleteRoleMappingsPrompt: DeleteRoleMappings = (
    roleMappingsToDelete,
    onSuccess = () => undefined,
    onCancel = () => undefined
  ) => {
    if (!roleMappingsToDelete || !roleMappingsToDelete.length) {
      throw new Error('No Role Mappings specified for delete');
    }
    setIsModalOpen(true);
    setRoleMappings(roleMappingsToDelete);
    onSuccessCallback.current = onSuccess;
    onCancelCallback.current = onCancel;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoleMappings([]);
  };

  const handleCancelModel = () => {
    closeModal();
    if (onCancelCallback.current) {
      onCancelCallback.current();
    }
  };

  const deleteRoleMappings = async () => {
    let result;

    setIsDeleteInProgress(true);

    try {
      result = await roleMappingsAPI.deleteRoleMappings(roleMappings.map((rm) => rm.name));
    } catch (e) {
      notifications.toasts.addError(e, {
        title: i18n.translate(
          'xpack.security.management.roleMappings.deleteRoleMapping.unknownError',
          {
            defaultMessage: 'Error deleting role mappings',
          }
        ),
      });
      setIsDeleteInProgress(false);
      return;
    }

    setIsDeleteInProgress(false);

    closeModal();

    const successfulDeletes = result.filter((res) => res.success);
    const erroredDeletes = result.filter((res) => !res.success);

    // Surface success notifications
    if (successfulDeletes.length > 0) {
      const hasMultipleSuccesses = successfulDeletes.length > 1;
      const successMessage = hasMultipleSuccesses
        ? i18n.translate(
            'xpack.security.management.roleMappings.deleteRoleMapping.successMultipleNotificationTitle',
            {
              defaultMessage: 'Deleted {count} role mappings',
              values: { count: successfulDeletes.length },
            }
          )
        : i18n.translate(
            'xpack.security.management.roleMappings.deleteRoleMapping.successSingleNotificationTitle',
            {
              defaultMessage: "Deleted role mapping ''{name}''",
              values: { name: successfulDeletes[0].name },
            }
          );
      notifications.toasts.addSuccess({
        title: successMessage,
        'data-test-subj': 'deletedRoleMappingSuccessToast',
      });
      if (onSuccessCallback.current) {
        onSuccessCallback.current(successfulDeletes.map(({ name }) => name));
      }
    }

    // Surface error notifications
    if (erroredDeletes.length > 0) {
      const hasMultipleErrors = erroredDeletes.length > 1;
      const errorMessage = hasMultipleErrors
        ? i18n.translate(
            'xpack.security.management.roleMappings.deleteRoleMapping.errorMultipleNotificationTitle',
            {
              defaultMessage: 'Error deleting {count} role mappings',
              values: {
                count: erroredDeletes.length,
              },
            }
          )
        : i18n.translate(
            'xpack.security.management.roleMappings.deleteRoleMapping.errorSingleNotificationTitle',
            {
              defaultMessage: "Error deleting role mapping ''{name}''",
              values: { name: erroredDeletes[0].name },
            }
          );
      notifications.toasts.addDanger(errorMessage);
    }
  };

  const renderModal = () => {
    if (!isModalOpen) {
      return null;
    }

    const isSingle = roleMappings.length === 1;

    return (
      <EuiConfirmModal
        aria-labelledby={confirmModalTitleId}
        titleProps={{ id: confirmModalTitleId }}
        title={
          isSingle
            ? i18n.translate(
                'xpack.security.management.roleMappings.deleteRoleMapping.confirmModal.deleteSingleTitle',
                {
                  defaultMessage: "Delete role mapping ''{name}''?",
                  values: { name: roleMappings[0].name },
                }
              )
            : i18n.translate(
                'xpack.security.management.roleMappings.deleteRoleMapping.confirmModal.deleteMultipleTitle',
                {
                  defaultMessage: 'Delete {count} role mappings?',
                  values: { count: roleMappings.length },
                }
              )
        }
        onCancel={handleCancelModel}
        onConfirm={deleteRoleMappings}
        cancelButtonText={i18n.translate(
          'xpack.security.management.roleMappings.deleteRoleMapping.confirmModal.cancelButtonLabel',
          { defaultMessage: 'Cancel' }
        )}
        confirmButtonText={i18n.translate(
          'xpack.security.management.roleMappings.deleteRoleMapping.confirmModal.confirmButtonLabel',
          {
            defaultMessage: 'Delete {count, plural, one {role mapping} other {role mappings}}',
            values: { count: roleMappings.length },
          }
        )}
        confirmButtonDisabled={isDeleteInProgress}
        buttonColor="danger"
        data-test-subj="deleteRoleMappingConfirmationModal"
      >
        {!isSingle ? (
          <Fragment>
            <p>
              {i18n.translate(
                'xpack.security.management.roleMappings.deleteRoleMapping.confirmModal.deleteMultipleListDescription',
                { defaultMessage: 'You are about to delete these role mappings:' }
              )}
            </p>
            <ul>
              {roleMappings.map(({ name }) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </Fragment>
        ) : null}
      </EuiConfirmModal>
    );
  };

  return (
    <Fragment>
      {children(deleteRoleMappingsPrompt)}
      {renderModal()}
    </Fragment>
  );
};
