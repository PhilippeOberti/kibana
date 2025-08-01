/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonGroup,
  EuiCallOut,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiSkeletonRectangle,
  EuiSpacer,
  EuiSwitch,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import { DataViewField } from '@kbn/data-views-plugin/common';
import {
  LazyDataViewPicker,
  LazyFieldPicker,
  withSuspense,
} from '@kbn/presentation-util-plugin/public';

import { asyncMap } from '@kbn/std';
import { DEFAULT_CONTROL_GROW, DEFAULT_CONTROL_WIDTH } from '@kbn/controls-constants';
import type { ControlWidth } from '@kbn/controls-schemas';
import type { DefaultDataControlState } from '../../../common';
import { dataViewsService } from '../../services/kibana_services';
import { getAllControlTypes, getControlFactory } from '../../control_factory_registry';
import type { ControlGroupApi } from '../../control_group/types';
import { DataControlEditorStrings } from './data_control_constants';
import { getDataControlFieldRegistry } from './data_control_editor_utils';
import { CONTROL_WIDTH_OPTIONS } from './editor_constants';
import {
  isDataControlFactory,
  type DataControlFactory,
  type DataControlFieldRegistry,
} from './types';
import { ControlFactory } from '../types';
import { confirmDeleteControl } from '../../common';

export interface ControlEditorProps<
  State extends DefaultDataControlState = DefaultDataControlState
> {
  initialState: Partial<State>;
  controlType?: string;
  controlId?: string;
  initialDefaultPanelTitle?: string;
  controlGroupApi: ControlGroupApi; // controls must always have a parent API
  onCancel: (newState: Partial<State>) => void;
  onSave: (newState: Partial<State>, type: string) => void;
  ariaLabelledBy: string;
}

const FieldPicker = withSuspense(LazyFieldPicker, null);
const DataViewPicker = withSuspense(LazyDataViewPicker, null);

const CompatibleControlTypesComponent = ({
  fieldRegistry,
  selectedFieldName,
  selectedControlType,
  setSelectedControlType,
}: {
  fieldRegistry?: DataControlFieldRegistry;
  selectedFieldName?: string;
  selectedControlType?: string;
  setSelectedControlType: (type: string) => void;
}) => {
  const [dataControlFactories, setDataControlFactories] = useState<
    DataControlFactory[] | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;

    asyncMap<string, ControlFactory>(getAllControlTypes(), async (controlType) =>
      getControlFactory(controlType)
    )
      .then((controlFactories) => {
        if (!cancelled) {
          setDataControlFactories(
            controlFactories
              .filter((factory) => isDataControlFactory(factory))
              .sort(
                (
                  { order: orderA = 0, getDisplayName: getDisplayNameA },
                  { order: orderB = 0, getDisplayName: getDisplayNameB }
                ) => {
                  const orderComparison = orderB - orderA; // sort descending by order
                  return orderComparison === 0
                    ? getDisplayNameA().localeCompare(getDisplayNameB()) // if equal order, compare display names
                    : orderComparison;
                }
              ) as unknown as DataControlFactory[]
          );
        }
      })
      .catch(() => {
        if (!cancelled) setDataControlFactories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EuiSkeletonRectangle
      isLoading={dataControlFactories === undefined}
      width="100px"
      height="100px"
    >
      <EuiKeyPadMenu data-test-subj={`controlTypeMenu`} aria-label={'type'}>
        {(dataControlFactories ?? []).map((factory) => {
          const disabled =
            fieldRegistry && selectedFieldName
              ? !fieldRegistry[selectedFieldName]?.compatibleControlTypes.includes(factory.type)
              : true;
          const keyPadMenuItem = (
            <EuiKeyPadMenuItem
              key={factory.type}
              id={`create__${factory.type}`}
              aria-label={factory.getDisplayName()}
              data-test-subj={`create__${factory.type}`}
              isSelected={factory.type === selectedControlType}
              disabled={disabled}
              onClick={() => setSelectedControlType(factory.type)}
              label={factory.getDisplayName()}
            >
              <EuiIcon type={factory.getIconType()} size="l" />
            </EuiKeyPadMenuItem>
          );

          return disabled ? (
            <EuiToolTip
              key={`disabled__${factory.type}`}
              content={DataControlEditorStrings.manageControl.dataSource.getControlTypeErrorMessage(
                {
                  fieldSelected: Boolean(selectedFieldName),
                  controlType: factory.type,
                }
              )}
            >
              {keyPadMenuItem}
            </EuiToolTip>
          ) : (
            keyPadMenuItem
          );
        })}
      </EuiKeyPadMenu>
    </EuiSkeletonRectangle>
  );
};

export const DataControlEditor = <State extends DefaultDataControlState = DefaultDataControlState>({
  initialState,
  controlId,
  controlType,
  initialDefaultPanelTitle,
  onSave,
  onCancel,
  controlGroupApi,
  ariaLabelledBy,
}: ControlEditorProps<State>) => {
  const [editorState, setEditorState] = useState<Partial<State>>(initialState);
  const [defaultPanelTitle, setDefaultPanelTitle] = useState<string>(
    initialDefaultPanelTitle ?? initialState.fieldName ?? ''
  );
  const [panelTitle, setPanelTitle] = useState<string>(initialState.title ?? defaultPanelTitle);
  const [selectedControlType, setSelectedControlType] = useState<string | undefined>(controlType);
  const [controlOptionsValid, setControlOptionsValid] = useState<boolean>(true);
  const editorConfig = useMemo(() => controlGroupApi.getEditorConfig(), [controlGroupApi]);

  const {
    loading: dataViewListLoading,
    value: dataViewListItems = [],
    error: dataViewListError,
  } = useAsync(async () => {
    return dataViewsService.getIdsWithTitle();
  });

  const {
    loading: dataViewLoading,
    value: { selectedDataView, fieldRegistry } = {
      selectedDataView: undefined,
      fieldRegistry: undefined,
    },
    error: fieldListError,
  } = useAsync(async () => {
    if (!editorState.dataViewId) {
      return;
    }

    const dataView = await dataViewsService.get(editorState.dataViewId);
    const registry = await getDataControlFieldRegistry(dataView);
    return {
      selectedDataView: dataView,
      fieldRegistry: registry,
    };
  }, [editorState.dataViewId]);

  const [controlFactory, setControlFactory] = useState<DataControlFactory | undefined>(undefined);
  useEffect(() => {
    if (!selectedControlType) {
      setControlFactory(undefined);
      return;
    }

    let cancelled = false;
    getControlFactory(selectedControlType)
      .then((nextControlFactory) => {
        if (!cancelled) {
          setControlFactory(nextControlFactory as unknown as DataControlFactory);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setControlFactory(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedControlType]);

  const CustomSettingsComponent = useMemo(() => {
    if (!controlFactory || !editorState.fieldName || !fieldRegistry) return;
    const CustomSettings = controlFactory.CustomOptionsComponent;

    if (!CustomSettings) return;

    return (
      <div data-test-subj="control-editor-custom-settings">
        <EuiSpacer size="m" />
        <CustomSettings
          initialState={initialState}
          field={fieldRegistry[editorState.fieldName].field}
          updateState={(newState) => setEditorState({ ...editorState, ...newState })}
          setControlEditorValid={setControlOptionsValid}
          controlGroupApi={controlGroupApi}
        />
      </div>
    );
  }, [fieldRegistry, controlFactory, initialState, editorState, controlGroupApi]);

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id={ariaLabelledBy}>
            {!controlId // if no ID, then we are creating a new control
              ? DataControlEditorStrings.manageControl.getFlyoutCreateTitle()
              : DataControlEditorStrings.manageControl.getFlyoutEditTitle()}
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody data-test-subj="control-editor-flyout">
        <EuiForm fullWidth>
          {!editorConfig?.hideDataViewSelector && (
            <EuiFormRow
              data-test-subj="control-editor-data-view-picker"
              label={DataControlEditorStrings.manageControl.dataSource.getDataViewTitle()}
            >
              {dataViewListError ? (
                <EuiCallOut
                  color="danger"
                  iconType="error"
                  title={DataControlEditorStrings.manageControl.dataSource.getDataViewListErrorTitle()}
                >
                  <p>{dataViewListError.message}</p>
                </EuiCallOut>
              ) : (
                <DataViewPicker
                  dataViews={dataViewListItems}
                  selectedDataViewId={editorState.dataViewId}
                  onChangeDataViewId={(newDataViewId) => {
                    setEditorState({ ...editorState, dataViewId: newDataViewId });
                    setSelectedControlType(undefined);
                  }}
                  trigger={{
                    label:
                      selectedDataView?.getName() ??
                      DataControlEditorStrings.manageControl.dataSource.getSelectDataViewMessage(),
                  }}
                  selectableProps={{ isLoading: dataViewListLoading }}
                />
              )}
            </EuiFormRow>
          )}

          <EuiFormRow label={DataControlEditorStrings.manageControl.dataSource.getFieldTitle()}>
            {fieldListError ? (
              <EuiCallOut
                color="danger"
                iconType="error"
                title={DataControlEditorStrings.manageControl.dataSource.getFieldListErrorTitle()}
              >
                <p>{fieldListError.message}</p>
              </EuiCallOut>
            ) : (
              <FieldPicker
                filterPredicate={(field: DataViewField) => {
                  const customPredicate = editorConfig?.fieldFilterPredicate?.(field) ?? true;
                  return Boolean(fieldRegistry?.[field.name]) && customPredicate;
                }}
                selectedFieldName={editorState.fieldName}
                dataView={selectedDataView}
                onSelectField={(field) => {
                  setEditorState({ ...editorState, fieldName: field.name });

                  /**
                   * make sure that the new field is compatible with the selected control type and, if it's not,
                   * reset the selected control type to the **first** compatible control type
                   */
                  const newCompatibleControlTypes =
                    fieldRegistry?.[field.name]?.compatibleControlTypes ?? [];
                  if (
                    !selectedControlType ||
                    !newCompatibleControlTypes.includes(selectedControlType!)
                  ) {
                    setSelectedControlType(newCompatibleControlTypes[0]);
                  }

                  /**
                   * set the control title (i.e. the one set by the user) + default title (i.e. the field display name)
                   */
                  const newDefaultTitle = field.displayName ?? field.name;
                  setDefaultPanelTitle(newDefaultTitle);
                  const currentTitle = editorState.title;
                  if (!currentTitle || currentTitle === newDefaultTitle) {
                    setPanelTitle(newDefaultTitle);
                  }

                  setControlOptionsValid(true); // reset options state
                }}
                selectableProps={{ isLoading: dataViewListLoading || dataViewLoading }}
              />
            )}
          </EuiFormRow>
          <EuiFormRow
            label={DataControlEditorStrings.manageControl.dataSource.getControlTypeTitle()}
          >
            {/* wrapping in `div` so that focus gets passed properly to the form row */}
            <div>
              <CompatibleControlTypesComponent
                fieldRegistry={fieldRegistry}
                selectedFieldName={editorState.fieldName}
                selectedControlType={selectedControlType}
                setSelectedControlType={setSelectedControlType}
              />
            </div>
          </EuiFormRow>
          <EuiFormRow
            label={DataControlEditorStrings.manageControl.displaySettings.getTitleInputTitle()}
          >
            <EuiFieldText
              data-test-subj="control-editor-title-input"
              placeholder={defaultPanelTitle}
              value={panelTitle}
              compressed
              onChange={(e) => {
                setPanelTitle(e.target.value ?? '');
                setEditorState({
                  ...editorState,
                  title: e.target.value === '' ? undefined : e.target.value,
                });
              }}
            />
          </EuiFormRow>
          {!editorConfig?.hideWidthSettings && (
            <EuiFormRow
              data-test-subj="control-editor-width-settings"
              label={DataControlEditorStrings.manageControl.displaySettings.getWidthInputTitle()}
            >
              <div>
                <EuiButtonGroup
                  buttonSize="compressed"
                  legend={DataControlEditorStrings.management.controlWidth.getWidthSwitchLegend()}
                  options={CONTROL_WIDTH_OPTIONS}
                  idSelected={editorState.width ?? DEFAULT_CONTROL_WIDTH}
                  onChange={(newWidth: string) =>
                    setEditorState({ ...editorState, width: newWidth as ControlWidth })
                  }
                />
                <EuiSpacer size="s" />
                <EuiSwitch
                  compressed
                  label={DataControlEditorStrings.manageControl.displaySettings.getGrowSwitchTitle()}
                  color="primary"
                  checked={editorState.grow ?? DEFAULT_CONTROL_GROW}
                  onChange={() => setEditorState({ ...editorState, grow: !editorState.grow })}
                  data-test-subj="control-editor-grow-switch"
                />
              </div>
            </EuiFormRow>
          )}
          {!editorConfig?.hideAdditionalSettings && CustomSettingsComponent}
        </EuiForm>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              aria-label={`cancel-${editorState.title ?? editorState.fieldName}`}
              data-test-subj="control-editor-cancel"
              onClick={() => {
                onCancel(editorState);
              }}
            >
              {DataControlEditorStrings.manageControl.getCancelTitle()}
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup responsive={false} justifyContent="flexEnd" gutterSize="s">
              {controlId && (
                <EuiButton
                  aria-label={`delete-${editorState.title ?? editorState.fieldName}`}
                  iconType="trash"
                  color="danger"
                  onClick={() => {
                    confirmDeleteControl().then((confirmed) => {
                      if (confirmed) {
                        onCancel(initialState); // don't want to show "lost changes" warning
                        controlGroupApi.removePanel(controlId!);
                      }
                    });
                  }}
                >
                  {DataControlEditorStrings.manageControl.getDeleteButtonTitle()}
                </EuiButton>
              )}
              <EuiButton
                aria-label={`save-${editorState.title ?? editorState.fieldName}`}
                data-test-subj="control-editor-save"
                fill
                color="primary"
                disabled={
                  !(
                    controlOptionsValid &&
                    Boolean(editorState.fieldName) &&
                    Boolean(selectedDataView) &&
                    Boolean(selectedControlType)
                  )
                }
                onClick={() => {
                  onSave(editorState, selectedControlType!);
                }}
              >
                {DataControlEditorStrings.manageControl.getSaveChangesTitle()}
              </EuiButton>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
