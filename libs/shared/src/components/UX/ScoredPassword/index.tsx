import React, { useCallback, useEffect, useState } from 'react';
import { defineMessage } from 'react-intl';
import { UxPassword } from '../Password';
import { ensureZxcvbn, getScore } from './score';
import { StrengthBar } from './StrengthBar';
import type { ZXCVBNResult } from 'zxcvbn';
import type { BaseProps, ValidateCB } from '../types';
import type { MessageWithValues } from '../../../types';

const passwordRequired = defineMessage({ defaultMessage: "Please enter a password of at least 'moderate' strength", description: "default password entry tooltip" })
const complexity = defineMessage({ defaultMessage: `This password requires {time} to crack`, description: "Password complexity tooltip feedback" });
const placeholder = defineMessage({ defaultMessage: 'At least moderate strength', description: 'New password entry placeholder'});
const label = defineMessage({ defaultMessage: 'Password', description: 'Default password entry label'});

type Props = Omit<BaseProps, "onValidate" | "defaultValue" | "tooltip" | "placeholder"|"intlLabel">;
export const UxScoredPassword = (props: Props) => {

  const [tooltip, setTooltip] = useState<MessageWithValues>(passwordRequired);
  const [stats, setStats] = useState<ZXCVBNResult | null>(null);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    ensureZxcvbn()
  })

  const onValidate: ValidateCB = useCallback((value) => {
    const stats = getScore(value);
    setStats(stats);
    if (stats) {
      const isValid = stats.score > 2;
      const tt = complexity;
      setTooltip({
        ...tt,
        values: { time: stats.crack_times_display.offline_slow_hashing_1e4_per_second }
      })
      setValid(isValid);
      if (!isValid) {
        if (stats.feedback.warning.length > 0) {
          return {
            id: "UntranslatableDynamicContent",
            defaultMessage: stats.feedback.warning
          }
        }
        else return passwordRequired;
      }
    }
    return null;
  }, [setStats, setTooltip, setValid]);

  return (
    <>
      <UxPassword
        onValidate={onValidate}
        intlLabel={label}
        tooltip={tooltip ?? passwordRequired}
        placeholder={placeholder}
        {...props}
      />
      <StrengthBar score={stats?.score} valid={valid} />
    </>
  )
}
