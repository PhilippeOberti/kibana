/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect, useState } from 'react';
import type { EcsSecurityExtension as Ecs } from '@kbn/securitysolution-ecs';
import type { DiscoverAppLocatorParams } from '@kbn/discover-plugin/common';
import { DISCOVER_APP_LOCATOR } from '@kbn/deeplinks-analytics';
import { useKibana } from '../../../../common/lib/kibana';
import { InvestigateAlertInDiscoverAction } from './investigate_alert_in_discover_action';

const TEST_ID = 'send-threshold-rule-alert-to-discover';

interface InvestigateThresholdRuleAlertInDiscoverWithESQLActionProps {
  /**
   *
   */
  ecsData: Ecs;
}

/**
 *
 */
export const InvestigateThresholdRuleAlertInDiscoverWithESQLAction = memo(
  ({ ecsData }: InvestigateThresholdRuleAlertInDiscoverWithESQLActionProps) => {
    const {
      services: { share },
    } = useKibana();
    const discoverLocator = share?.url.locators.get<DiscoverAppLocatorParams>(DISCOVER_APP_LOCATOR);

    const [url, setUrl] = useState('');

    useEffect(() => {
      let unmounted = false;

      const getDiscoverUrl = async (): Promise<void> => {
        if (!discoverLocator) {
          // eslint-disable-next-line no-console
          console.error('Discover locator not available');
          return;
        }

        // return discoverLocator?.getUrl({
        const discoverUrl = await discoverLocator.getUrl({});
        if (unmounted) return;
        setUrl(discoverUrl);
      };

      getDiscoverUrl();

      return () => {
        unmounted = true;
      };
    }, [discoverLocator]);

    if (!url) return;

    return <InvestigateAlertInDiscoverAction data-test-subj={TEST_ID} esql={true} url={url} />;
  }
);

InvestigateThresholdRuleAlertInDiscoverWithESQLAction.displayName =
  'InvestigateThresholdRuleAlertInDiscoverWithESQLAction';
