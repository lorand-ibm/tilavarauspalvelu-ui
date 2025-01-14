import React from "react";
import styled from "styled-components";
import { LoadingSpinner } from "hds-react";

const Wrapper = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
`;

const StyledLoadingSpinner = styled(LoadingSpinner)`
  position: absolute;
  left: 48%;
  top: 40%;
`;

export const FullscreenSpinner = (): JSX.Element => {
  return (
    <Wrapper>
      <StyledLoadingSpinner />
    </Wrapper>
  );
};
