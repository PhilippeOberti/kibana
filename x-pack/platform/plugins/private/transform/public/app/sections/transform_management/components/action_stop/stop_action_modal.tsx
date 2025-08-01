/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { useMemo } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiConfirmModal, EUI_MODAL_CONFIRM_BUTTON, useGeneratedHtmlId } from '@elastic/eui';
import type { StopAction } from './use_stop_action';
import { isManagedTransform } from '../../../../common/managed_transforms_utils';
import { ManagedTransformsWarningCallout } from '../managed_transforms_callout/managed_transforms_callout';

export const StopActionModal: FC<StopAction> = ({ closeModal, items, stopAndCloseModal }) => {
  const confirmModalTitleId = useGeneratedHtmlId();

  const hasManagedTransforms = useMemo(() => items.some((t) => isManagedTransform(t)), [items]);

  const isBulkAction = items.length > 1;

  const bulkStopModalTitle = i18n.translate('xpack.transform.transformList.bulkStopModalTitle', {
    defaultMessage: 'Stop {count} {count, plural, one {transform} other {transforms}}?',
    values: { count: items && items.length },
  });
  const stopModalTitle = i18n.translate('xpack.transform.transformList.stopModalTitle', {
    defaultMessage: 'Stop {transformId}?',
    values: { transformId: items[0] && items[0].config.id },
  });

  return (
    <EuiConfirmModal
      data-test-subj="transformStopModal"
      aria-labelledby={confirmModalTitleId}
      title={isBulkAction === true ? bulkStopModalTitle : stopModalTitle}
      titleProps={{ id: confirmModalTitleId }}
      onCancel={closeModal}
      onConfirm={() => stopAndCloseModal(items)}
      cancelButtonText={i18n.translate('xpack.transform.transformList.startModalCancelButton', {
        defaultMessage: 'Cancel',
      })}
      confirmButtonText={i18n.translate('xpack.transform.transformList.startModalStopButton', {
        defaultMessage: 'Stop',
      })}
      defaultFocusedButton={EUI_MODAL_CONFIRM_BUTTON}
      buttonColor="primary"
    >
      {hasManagedTransforms ? (
        <ManagedTransformsWarningCallout
          count={items.length}
          action={i18n.translate('xpack.transform.transformList.stopManagedTransformsDescription', {
            defaultMessage: 'stopping',
          })}
        />
      ) : null}
    </EuiConfirmModal>
  );
};
