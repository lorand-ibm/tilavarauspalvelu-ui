import { Koros } from "hds-react";
import React from "react";
import styled from "styled-components";

type Props = {
  from?: string;
  to?: string;
  className?: string;
};

const Wrapper = styled.div<{ $from: string; $to: string }>`
  ${({ $from, $to }) => `
    background-color: ${$from};
    fill: ${$to};
  `}
`;

const KorosDefault = ({ from, to, className }: Props): JSX.Element => {
  return (
    <Wrapper $from={from} $to={to} className={className}>
      <Koros type="basic" />
    </Wrapper>
  );
};

export default KorosDefault;
