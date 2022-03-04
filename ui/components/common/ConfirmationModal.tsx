import { Dialog } from "hds-react";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { MediumButton } from "../../styles/util";

type Props = {
  okLabel?: string;
  cancelLabel?: string;
  onOk?: () => void;
  onCancel?: () => void;
  heading?: string;
  content?: string;
  id: string;
};

const ConfirmationModal = forwardRef(
  (
    {
      id,
      heading,
      content,
      onOk,
      onCancel,
      okLabel = "common:ok",
      cancelLabel = "common:cancel",
    }: Props,
    ref
  ): JSX.Element | null => {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      open() {
        setOpen(true);
      },
    }));

    const root = document.getElementById("modal-root");
    if (!root) {
      return null;
    }

    return ReactDOM.createPortal(
      <Dialog
        variant="danger"
        isOpen={open}
        id={id}
        aria-labelledby={`${id}-header`}
        aria-describedby={`${id}-content`}
      >
        <Dialog.Header id="header" title={heading} />
        <Dialog.Content id={`${id}-content`}>{content}</Dialog.Content>
        <Dialog.ActionButtons>
          <MediumButton
            variant="secondary"
            onClick={() => {
              setOpen(false);
              if (onCancel) {
                onCancel();
              }
            }}
          >
            {t(cancelLabel)}
          </MediumButton>
          <MediumButton
            onClick={() => {
              setOpen(false);
              if (onOk) {
                onOk();
              }
            }}
          >
            {t(okLabel)}
          </MediumButton>
        </Dialog.ActionButtons>
      </Dialog>,
      root
    );
  }
);

export type ModalRef = {
  open: () => void;
};

export default ConfirmationModal;
