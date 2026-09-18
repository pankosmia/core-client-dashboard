import { doI18n } from "pankosmia-lib/i18n";

function ButtonIconForInterface(i18nRef, Icon, onClickFunction, title) {
  <Tooltip
    title={doI18n(`pages:core-dashboard:${title}`, i18nRef.current)}
    disableInteractive
    placement="right"
  >
    <IconButton
      onClick={() => {
        onClickFunction();
      }}
    >
      <Icon />
    </IconButton>
  </Tooltip>;
}
