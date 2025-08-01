/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiButton,
  EuiFlexItem,
  EuiFlexGroup,
  EuiComboBox,
  EuiFormRow,
  EuiText,
  EuiSpacer,
  EuiCallOut,
  EuiLoadingSpinner,
  EuiComboBoxOptionOption,
} from '@elastic/eui';
import { CodeEditor } from '@kbn/code-editor';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { AuthenticatedUser } from '@kbn/security-plugin-types-common';
import React, { useEffect, useState, useMemo, useCallback } from 'react';

interface Alert {
  _id: string;
  _index: string;
  _source: {
    '@timestamp': string;
    'kibana.alert.rule.name': string;
    'kibana.alert.rule.uuid': string;
    'kibana.alert.severity': string;
    'kibana.alert.status': string;
    'kibana.alert.reason': string;
    [key: string]: any;
  };
}

interface AlertsResponse {
  hits: {
    hits: Alert[];
    total: { value: number; relation: string };
  };
}

export function WorkflowEventModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: Record<string, any>) => void;
}) {
  const { services } = useKibana();
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!services.http) {
      setAlertsError('HTTP service not available');
      return;
    }

    setAlertsLoading(true);
    setAlertsError(null);

    try {
      // Query for recent alerts (last 24 hours)
      const query = {
        bool: {
          filter: [
            {
              range: {
                '@timestamp': {
                  gte: 'now-24h',
                  lte: 'now',
                },
              },
            },
          ],
        },
      };

      const response = await services.http.post<AlertsResponse>(
        '/api/detection_engine/signals/search',
        {
          body: JSON.stringify({
            query,
            size: 50, // Limit to 50 recent alerts
            sort: [{ '@timestamp': { order: 'desc' } }],
            _source: [
              '@timestamp',
              'kibana.alert.rule.name',
              'kibana.alert.rule.uuid',
              'kibana.alert.severity',
              'kibana.alert.status',
              'kibana.alert.reason',
              'agent.name',
              'host.name',
              'user.name',
              'process.name',
              'file.name',
              'source.ip',
              'destination.ip',
            ],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          version: '2023-10-31',
        }
      );

      if (response && response.hits && response.hits.hits) {
        setAlerts(response.hits.hits);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      setAlertsError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, [services.http]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        if (services.security) {
          const user = await services.security.authc.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    getCurrentUser();
  }, [services.security]);

  const getDefaultWorkflowInputs = () => {
    const userEmail = currentUser?.email || 'workflow-user@gmail.com';
    const userName = currentUser?.username || 'workflow-user';
    return JSON.stringify(
      {
        event: {
          ruleName: 'Detect vulnerabilities',
          additionalData: {
            user: userEmail,
            userName,
          },
        },
      },
      null,
      2
    );
  };

  const handleSubmit = () => {
    onSubmit(JSON.parse(workflowEvent));
    onClose();
  };

  const [workflowEvent, setWorkflowEvent] = useState<string>(getDefaultWorkflowInputs());

  // Convert alerts to combobox options
  const alertOptions: EuiComboBoxOptionOption[] = useMemo(() => {
    return alerts.map((alert) => ({
      label: `${alert._source['kibana.alert.rule.name']} - ${
        alert._source['kibana.alert.severity']
      } (${new Date(alert._source['@timestamp']).toLocaleString()})`,
      value: alert._id,
    }));
  }, [alerts]);

  const handleAlertSelection = (selectedOptions: EuiComboBoxOptionOption[]) => {
    if (selectedOptions.length > 0) {
      const selectedAlertId = selectedOptions[0].value;
      const alert = alerts.find((a) => a._id === selectedAlertId);
      if (!alert) return;

      setSelectedAlert(alert);

      // Create workflow event from alert data
      const alertEvent = {
        event: {
          alert: {
            id: alert._id,
            index: alert._index,
            timestamp: alert._source['@timestamp'],
            rule: {
              name: alert._source['kibana.alert.rule.name'],
              uuid: alert._source['kibana.alert.rule.uuid'],
            },
            severity: alert._source['kibana.alert.severity'],
            status: alert._source['kibana.alert.status'],
            reason: alert._source['kibana.alert.reason'],
            ...(alert._source['agent.name'] && { agent: { name: alert._source['agent.name'] } }),
            ...(alert._source['host.name'] && { host: { name: alert._source['host.name'] } }),
            ...(alert._source['user.name'] && { user: { name: alert._source['user.name'] } }),
            ...(alert._source['process.name'] && {
              process: { name: alert._source['process.name'] },
            }),
            ...(alert._source['file.name'] && { file: { name: alert._source['file.name'] } }),
            ...(alert._source['source.ip'] && { source: { ip: alert._source['source.ip'] } }),
            ...(alert._source['destination.ip'] && {
              destination: { ip: alert._source['destination.ip'] },
            }),
          },
          additionalData: {
            user: currentUser?.email || 'workflow-user@gmail.com',
            userName: currentUser?.username || 'workflow-user',
          },
        },
      };

      setWorkflowEvent(JSON.stringify(alertEvent, null, 2));
    } else {
      setSelectedAlert(null);
      setWorkflowEvent(getDefaultWorkflowInputs());
    }
  };

  return (
    <EuiModal onClose={onClose} maxWidth={1400} style={{ width: '1200px' }}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Run Workflow</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFlexGroup direction="column" gutterSize="l">
          {/* Alerts Dropdown Section */}
          <EuiFlexItem>
            <EuiFormRow
              label="Select Alert (Optional)"
              helpText="Choose a recent security alert to populate the workflow event data"
            >
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem>
                  {alertsLoading ? (
                    <EuiFlexGroup alignItems="center" gutterSize="s">
                      <EuiFlexItem grow={false}>
                        <EuiLoadingSpinner size="m" />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <EuiText size="s">Loading alerts...</EuiText>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ) : (
                    <EuiComboBox
                      placeholder="Select an alert to populate event data"
                      options={alertOptions}
                      selectedOptions={
                        selectedAlert
                          ? alertOptions.filter((opt) => opt.value === selectedAlert._id)
                          : []
                      }
                      onChange={handleAlertSelection}
                      singleSelection={{ asPlainText: true }}
                      isClearable={true}
                      data-test-subj="workflow-alert-selector"
                    />
                  )}
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    size="s"
                    iconType="refresh"
                    onClick={fetchAlerts}
                    isLoading={alertsLoading}
                  >
                    Refresh
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          </EuiFlexItem>

          {/* Error Display */}
          {alertsError && (
            <EuiFlexItem>
              <EuiCallOut title="Failed to load alerts" color="warning" iconType="help" size="s">
                <p>{alertsError}</p>
                <EuiText size="s">
                  Make sure you have the proper permissions to access security alerts, or manually
                  enter the event data below.
                </EuiText>
              </EuiCallOut>
            </EuiFlexItem>
          )}

          {/* Alert Info */}
          {selectedAlert && (
            <EuiFlexItem>
              <EuiCallOut title="Alert Selected" color="success" iconType="check" size="s">
                <EuiText size="s">
                  <strong>{selectedAlert._source['kibana.alert.rule.name']}</strong> - Severity:{' '}
                  {selectedAlert._source['kibana.alert.severity']} - Status:{' '}
                  {selectedAlert._source['kibana.alert.status']}
                </EuiText>
              </EuiCallOut>
            </EuiFlexItem>
          )}

          <EuiSpacer size="m" />

          {/* Event Data Editor */}
          <EuiFlexItem>
            <EuiFormRow
              label="Event Data"
              helpText="JSON payload that will be passed to the workflow"
              fullWidth
            >
              <CodeEditor
                languageId="json"
                value={workflowEvent}
                height={400}
                width="100%"
                editorDidMount={() => {}}
                onChange={setWorkflowEvent}
                suggestionProvider={undefined}
                dataTestSubj={'workflow-event-json-editor'}
                options={{
                  language: 'json',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>

          {/* Action Button */}
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButton onClick={handleSubmit} fill>
                  Run Workflow
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
    </EuiModal>
  );
}
