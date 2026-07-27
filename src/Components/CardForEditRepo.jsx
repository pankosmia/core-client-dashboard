import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid2,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import SvgVersionManager from "../fileIcon/iconVersionManager";
import { getJson, postEmptyJson } from "pankosmia-lib/http";
import { i18nContext } from "pankosmia-rcl";
import { useContext, useState } from "react";
import { allInterfaces } from "../utils/extractClientInterfaceItems";
import { currentProjectContext } from "pankosmia-rcl";
import { doI18n } from "pankosmia-lib/i18n";

const flavorTypes = {
  texttranslation: "scripture",
  audiotranslation: "scripture",
  "x-bcvnotes": "parascriptural",
  "x-bnotes": "parascriptural",
  "x-bcvarticles": "parascriptural",
  "x-bcvquestions": "parascriptural",
  "x-bcvimages": "parascriptural",
  "x-juxtalinear": "scripture",
  "x-parallel": "parascriptural",
  textstories: "gloss",
  "x-obsquestions": "peripheral",
  "x-obsnotes": "peripheral",
  "x-obsarticles": "peripheral",
  "x-obsimages": "peripheral",
  "x-tcore": "parascriptural",
  "x-printspec": "peripheral",
};

export function CardForEditRepo({
  repo,
  interfacesProps,
  RightActions,
  editTable,
}) {
  const [subMenuButtonSave, setSubMenuButtonSave] = useState(null);
  const [subMenuAboutRepo, setSubMenuAboutRepo] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { i18nRef } = useContext(i18nContext);
  const { currentProjectRef } = useContext(currentProjectContext);

  let {
    aboutRepoInterface,
    versionManagerInterface,
    tC4ProjectInterface,
    itemExportInterface,
  } = interfacesProps;

  const handleSubMenuClick = (event) => {
    setSubMenuButtonSave(event.currentTarget);
  };

  return (
    <Grid2 item size={{ xs: 12, md: 6, xl: 4 }} sx={{ display: "flex" }}>
      <Card
        elevation={1}
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            height: "100%",
          }}
        >
          <CardActionArea
            sx={{ height: "100%" }}
            onClick={async () => {
              const fullMetadataResponse = await getJson(
                `/api/burrito/metadata/raw/${repo[0]}`,
              );
              if (fullMetadataResponse.ok && repo[1].flavor) {
                const clickedProjectBits = repo[0].split("/");
                const clickedProjectJson = {
                  source: clickedProjectBits[0],
                  organization: clickedProjectBits[1],
                  project: clickedProjectBits[2],
                };
                if (
                  !currentProjectRef.current ||
                  clickedProjectJson.source !==
                    currentProjectRef.current.source ||
                  clickedProjectJson.organization !==
                    currentProjectRef.current.organization ||
                  clickedProjectJson.project !==
                    currentProjectRef.current.project
                ) {
                  if (editTable[repo[1].flavor]) {
                    const bookCodes = Object.entries(
                      fullMetadataResponse.json.ingredients,
                    )
                      .map((i) => Object.keys(i[1].scope || {}))
                      .reduce((a, b) => [...a, ...b], []);
                    await postEmptyJson(
                      `/api/navigation/bcv/${bookCodes[0]}/1/1`,
                    );
                    await postEmptyJson(
                      `/api/app-state/current-project/${repo[0]}`,
                    );
                  }
                }

                window.location.href = `/clients/${editTable[repo[1].flavor]}?returnTypePage=dashboard`;
              } else {
                const item = aboutRepoInterface?.find(
                  (i) => i.category === repo[1].flavor || i.category === "all",
                );
                if (item) {
                  window.location.href = item.url.replace(
                    "%%REPO_PATH%%",
                    repo[0],
                  );
                  return;
                }
                console.log("Metadata fetch failed");
                console.log(fullMetadataResponse);
              }
            }}
          >
            <CardContent sx={{ flex: "1 0 auto" }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  component="div"
                  variant="h5"
                  sx={{ color: "text.primary" }}
                >
                  {repo[1].name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  {doI18n(
                    `flavors:names:${flavorTypes[repo[1].flavor.toLowerCase()]}/${repo[1].flavor}`,
                    i18nRef.current,
                  )}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  {repo[1].abbreviation}
                </Typography>
                {repo[1].book_codes.length > 0 && (
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ color: "text.secondary" }}
                  >
                    {`${repo[1].book_codes.length} ${doI18n(`pages:core-dashboard:book${repo[1].book_codes.length === 1 ? "" : "s"}`, i18nRef.current)}`}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </CardActionArea>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              margin: "4px",
            }}
          >
            {RightActions?.filter((a) => a.condition).map((action, index) => {
              if (action.type === "menu") {
                return (
                  <Box key={index}>
                    <Tooltip title={action.tooltip}>
                      <IconButton
                        onClick={(event) => {
                          setSubMenuButtonSave(event.currentTarget);
                          setOpenSubMenu(repo[0]);
                        }}
                      >
                        {action.icon}
                      </IconButton>
                    </Tooltip>

                    <Menu
                      anchorEl={subMenuButtonSave}
                      open={openSubMenu === repo[0]}
                      onClose={() => {
                        setSubMenuButtonSave(null);
                        setOpenSubMenu(null);
                      }}
                    >
                      {action.menuItems.map((item) => (
                        <MenuItem
                          key={item.label}
                          onClick={() => (window.location.href = item.url)}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                );
              }

              return (
                <Tooltip key={index} title={action.tooltip}>
                  <IconButton onClick={(event) => action.action(event, repo)}>
                    {action.icon}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Card>
    </Grid2>
  );
}
