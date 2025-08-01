/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useMemo } from 'react';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
} from '@elastic/eui';
import { useBatchedPublishingSubjects } from '@kbn/presentation-publishing';

import { StateManager } from '@kbn/presentation-publishing/state_manager/types';
import type { ControlsLabelPosition, ControlsIgnoreParentSettings } from '@kbn/controls-schemas';
import { CONTROL_LAYOUT_OPTIONS } from '../../controls/data_controls/editor_constants';
import { ControlGroupStrings } from '../control_group_strings';
import type { ControlGroupApi, ControlGroupEditorState } from '../types';
import { ControlSettingTooltipLabel } from './control_setting_tooltip_label';

interface Props {
  onCancel: () => void;
  onSave: () => void;
  onDeleteAll: () => void;
  stateManager: StateManager<ControlGroupEditorState>;
  api: ControlGroupApi; // controls must always have a parent API
}

export const ControlGroupEditor = ({ onCancel, onSave, onDeleteAll, stateManager, api }: Props) => {
  const [
    children,
    selectedLabelPosition,
    selectedChainingSystem,
    selectedAutoApplySelections,
    selectedIgnoreParentSettings,
  ] = useBatchedPublishingSubjects(
    api.children$,
    stateManager.api.labelPosition$,
    stateManager.api.chainingSystem$,
    stateManager.api.autoApplySelections$,
    stateManager.api.ignoreParentSettings$
  );

  const controlCount = useMemo(() => Object.keys(children).length, [children]);

  const updateIgnoreSetting = useCallback(
    (newSettings: Partial<ControlsIgnoreParentSettings>) => {
      stateManager.api.setIgnoreParentSettings({
        ...(selectedIgnoreParentSettings ?? {}),
        ...newSettings,
      });
    },
    [stateManager.api, selectedIgnoreParentSettings]
  );

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2>{ControlGroupStrings.management.getFlyoutTitle()}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody data-test-subj="control-group-settings-flyout">
        <EuiForm component="form" fullWidth>
          <EuiFormRow label={ControlGroupStrings.management.labelPosition.getLabelPositionTitle()}>
            <EuiButtonGroup
              buttonSize="compressed"
              options={CONTROL_LAYOUT_OPTIONS}
              data-test-subj="control-group-layout-options"
              idSelected={selectedLabelPosition}
              legend={ControlGroupStrings.management.labelPosition.getLabelPositionLegend()}
              onChange={(newPosition: string) => {
                stateManager.api.setLabelPosition(newPosition as ControlsLabelPosition);
              }}
            />
          </EuiFormRow>

          <EuiFormRow
            label={ControlGroupStrings.management.filteringSettings.getFilteringSettingsTitle()}
          >
            <div>
              <EuiSwitch
                compressed
                data-test-subj="control-group-filter-sync"
                label={ControlGroupStrings.management.filteringSettings.getUseGlobalFiltersTitle()}
                onChange={(e) =>
                  updateIgnoreSetting({
                    ignoreFilters: !e.target.checked,
                    ignoreQuery: !e.target.checked,
                  })
                }
                checked={
                  !Boolean(selectedIgnoreParentSettings?.ignoreFilters) ||
                  !Boolean(selectedIgnoreParentSettings?.ignoreQuery)
                }
              />
              <EuiSpacer size="s" />
              <EuiSwitch
                compressed
                data-test-subj="control-group-query-sync-time-range"
                label={ControlGroupStrings.management.filteringSettings.getUseGlobalTimeRangeTitle()}
                onChange={(e) => updateIgnoreSetting({ ignoreTimerange: !e.target.checked })}
                checked={!Boolean(selectedIgnoreParentSettings?.ignoreTimerange)}
              />
            </div>
          </EuiFormRow>

          <EuiFormRow
            label={ControlGroupStrings.management.selectionSettings.getSelectionSettingsTitle()}
          >
            <div>
              <EuiSwitch
                compressed
                data-test-subj="control-group-validate-selections"
                label={
                  <ControlSettingTooltipLabel
                    label={ControlGroupStrings.management.selectionSettings.validateSelections.getValidateSelectionsTitle()}
                    tooltip={ControlGroupStrings.management.selectionSettings.validateSelections.getValidateSelectionsTooltip()}
                  />
                }
                checked={!Boolean(selectedIgnoreParentSettings?.ignoreValidations)}
                onChange={(e) => updateIgnoreSetting({ ignoreValidations: !e.target.checked })}
              />
              <EuiSpacer size="s" />
              <EuiSwitch
                compressed
                data-test-subj="control-group-chaining"
                label={
                  <ControlSettingTooltipLabel
                    label={ControlGroupStrings.management.selectionSettings.controlChaining.getHierarchyTitle()}
                    tooltip={ControlGroupStrings.management.selectionSettings.controlChaining.getHierarchyTooltip()}
                  />
                }
                checked={selectedChainingSystem === 'HIERARCHICAL'}
                onChange={(e) =>
                  stateManager.api.setChainingSystem(e.target.checked ? 'HIERARCHICAL' : 'NONE')
                }
              />
              <EuiSpacer size="s" />
              <EuiSwitch
                compressed
                data-test-subj="control-group-auto-apply-selections"
                label={
                  <ControlSettingTooltipLabel
                    label={ControlGroupStrings.management.selectionSettings.showApplySelections.getShowApplySelectionsTitle()}
                    tooltip={ControlGroupStrings.management.selectionSettings.showApplySelections.getShowApplySelectionsTooltip()}
                  />
                }
                checked={selectedAutoApplySelections}
                onChange={(e) => stateManager.api.setAutoApplySelections(e.target.checked)}
              />
            </div>
          </EuiFormRow>

          {controlCount > 0 && (
            <>
              <EuiHorizontalRule margin="m" />
              <EuiFormRow>
                <EuiButtonEmpty
                  onClick={onDeleteAll}
                  data-test-subj="delete-all-controls-button"
                  aria-label={'delete-all'}
                  iconType="trash"
                  color="danger"
                  flush="left"
                  size="s"
                >
                  {ControlGroupStrings.management.getDeleteAllButtonTitle()}
                </EuiButtonEmpty>
              </EuiFormRow>
            </>
          )}
        </EuiForm>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              aria-label={`cancel-editing-group`}
              flush="left"
              onClick={() => {
                onCancel();
              }}
            >
              {ControlGroupStrings.getCancelTitle()}
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              aria-label={`save-group`}
              fill
              color="primary"
              data-test-subj="control-group-editor-save"
              onClick={() => {
                onSave();
              }}
            >
              {ControlGroupStrings.getSaveChangesTitle()}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
