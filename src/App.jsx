import React, { useState, useEffect, useContext } from "react";
import {
  Grid2,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Box,
  Button,
  Typography,
  Stack,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { getAndSetJson, postEmptyJson, getJson } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";

import {
  i18nContext,
  netContext,
  debugContext,
  PanStepperPicker,
} from "pankosmia-rcl";

import Markdown from "react-markdown";
import { Walkthrough } from "./Walkthrough";
import { CardForEditRepo } from "./Components/CardForEditRepo";
import { allInterfaces } from "./utils/extractClientInterfaceItems";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import SvgVersionManager from "./fileIcon/iconVersionManager";

const getEditDocumentKeys = (data) => {
  let map = {};
  for (let [l, v] of Object.entries(data)) {
    if (!v.endpoints) continue;
    for (let [k, t] of Object.entries(v.endpoints)) {
      if (t.edit) {
        if (!map[k]) {
          map[k] = [];
        }

        map[k].push(`${l}#${t.edit.url}`);
      }
    }
  }
  return map;
};

function App() {
  const [clients, setClients] = useState([]);
  const [editTable, setEditTable] = useState({});
  const [projectSummaries, setProjectSummaries] = useState({});
  const [showWelcome, setShowWelcome] = useState(
    localStorage.getItem("showWelcome") === null ? true : false,
  );
  const [clientInterfaces, setClientInterfaces] = useState({});
  const [createAnchorEl, setCreateAnchorEl] = useState(null);
  const { i18nRef } = useContext(i18nContext);
  const { enabledRef } = useContext(netContext);
  const { debugRef } = useContext(debugContext);
  const matchPart = "/createDocument/textTranslation";
  const [storageId, setStorageId] = useState(null);

  useEffect(() => {
    fetch("/storage_id.json")
      .then((r) => r.json())
      .then((data) => setStorageId(data.id))
      .catch(() => {});
  }, []);

  storageId && console.log("storage_id", storageId);

  const editableRepos = Object.entries(projectSummaries).filter(
    ([repoPath, project]) =>
      repoPath.startsWith("_local_/_local_") &&
      !repoPath.includes("images") &&
      project.flavor != "x-tcore" &&
      (editTable[project.flavor] || project.flavor === "textTranslation"),
  );

  const createItems = (() => {
    if (!clientInterfaces) return [];

    const all = Object.entries(clientInterfaces).flatMap(([category, cv]) =>
      Object.values(cv?.endpoints || {}).flatMap((ev) =>
        (ev?.create_document || []).map((doc) => ({
          category,
          label: doI18n(doc.label, i18nRef.current),
          url: `/clients/${category}/#${doc.url}?returnTypePage=dashboard`,
        })),
      ),
    );
    // move "Biblical Text" to the front if present
    const idx = all.findIndex(
      (i) => i.url === matchPart || i.url.includes(matchPart),
    );
    if (idx > -1) all.unshift(all.splice(idx, 1)[0]);

    return all;
  })();

  let {
    aboutRepoInterface,
    versionManagerInterface,
    tC4ProjectInterface,
    itemExportInterface,
    importTc4Interface,
  } = allInterfaces(clientInterfaces, i18nRef);

  const getProjectSummaries = async () => {
    const summariesResponse = await getJson(
      `/api/burrito/metadata/summaries`,
      debugRef.current,
    );
    if (summariesResponse.ok) {
      setProjectSummaries(summariesResponse.json);
    }
  };
  useEffect(() => {
    getProjectSummaries().then();
  }, []);
  const handleCreateClose = () => {
    setCreateAnchorEl(null);
  };
  useEffect(() => {
    getAndSetJson({
      url: "/api/list-clients",
      setter: setClients,
    }).then();
  }, []);

  useEffect(() => {
    getJson("/api/client-interfaces")
      .then((res) => res.json)
      .then((data) => {
        PanStepperPicker;
        setEditTable(getEditDocumentKeys(data));
        setClientInterfaces(data);
      })
      .catch((err) => console.error("Error :", err));
  }, []);

  return (
    <Box
      sx={{
        mb: 2,
        position: "fixed",
        top: "64px",
        bottom: 0,
        right: 0,
        overflow: "auto",
        width: "100%",
      }}
    >
      <Grid2 container spacing={2} sx={{ m: 2 }}>
        {showWelcome && (
          <Grid2 item size={12}>
            <Card elevation={1} sx={{ backgroundColor: "#E5F6FD" }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {doI18n("pages:core-dashboard:welcome", i18nRef.current)}
                </Typography>
                <Typography sx={{ mt: 2 }} color="gray" variant="body2">
                  {`${doI18n("branding:software:name", i18nRef.current)} ${doI18n("pages:core-dashboard:welcome_desc1", i18nRef.current)}`}
                  <br />
                  {doI18n(
                    "pages:core-dashboard:welcome_desc2",
                    i18nRef.current,
                  )}
                  <br />
                  <br />
                  {`${doI18n("branding:software:name", i18nRef.current)} ${doI18n("pages:core-dashboard:welcome_desc3", i18nRef.current)}`}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    setShowWelcome(false);
                    localStorage.setItem("showWelcome", "welcomeIsDisabled");
                  }}
                >
                  {doI18n("pages:core-dashboard:close", i18nRef.current)}
                </Button>
              </CardActions>
            </Card>
          </Grid2>
        )}
        {!showWelcome && <Walkthrough />}
        <Grid2 item size={12}>
          <Stack direction="row" spacing={1}>
            <Chip
              label={doI18n(
                "pages:core-dashboard:create_content",
                i18nRef.current,
              )}
              color="secondary"
              variant="outlined"
              onClick={(event) => setCreateAnchorEl(event.currentTarget)}
            />
            {!enabledRef?.current ? (
              <Tooltip
                slotProps={{
                  popper: {
                    modifiers: [
                      { name: "offset", options: { offset: [15, -5] } },
                    ],
                  },
                }}
                title={doI18n(
                  "pages:core-dashboard:connect_to_internet",
                  i18nRef.current,
                )}
              >
                <span>
                  <Chip
                    label={doI18n(
                      "pages:core-dashboard:download_from_internet",
                      i18nRef.current,
                    )}
                    color="secondary"
                    variant="outlined"
                    disabled
                  />
                </span>
              </Tooltip>
            ) : (
              <Chip
                label={doI18n(
                  "pages:core-dashboard:download_from_internet",
                  i18nRef.current,
                )}
                color="secondary"
                variant="outlined"
                onClick={() =>
                  (window.location.href =
                    "/clients/download?returnTypePage=dashboard")
                }
              />
            )}
            <Chip
              label={doI18n(
                "pages:core-dashboard:go_to_documents",
                i18nRef.current,
              )}
              color="secondary"
              variant="outlined"
              onClick={() => (window.location.href = "/clients/content")}
            />
            {importTc4Interface.length > 0 && (
              <Chip
                label={doI18n(importTc4Interface[0].label, i18nRef.current)}
                color="secondary"
                variant="outlined"
                onClick={() =>
                  (window.location.href = importTc4Interface[0].url)
                }
              />
            )}

            <Menu
              id="grouped-menu"
              anchorEl={createAnchorEl}
              open={!!createAnchorEl}
              onClose={handleCreateClose}
            >
              {createItems.map((item) => (
                <MenuItem onClick={() => (window.location.href = item.url)}>
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Grid2>
        <Grid2 item size={12} sx={{ mt: 2 }}>
          <Typography variant="h5">
            {doI18n("pages:core-dashboard:my_work", i18nRef.current)}
          </Typography>
        </Grid2>
        {editableRepos.length > 0 ? (
          editableRepos.map((repo) => (
            <CardForEditRepo
              repo={repo}
              editTable={editTable}
              interfacesProps={{
                aboutRepoInterface,
                versionManagerInterface,
                tC4ProjectInterface,
                itemExportInterface,
              }}
              RightActions={[
                {
                  interface: aboutRepoInterface,
                  icon: <InfoOutlinedIcon />,
                  type: "button",
                  action: (event, repo) => {
                    console.log(repo);
                    const item = aboutRepoInterface.find(
                      (i) =>
                        i.category === repo[1].flavor || i.category === "all",
                    );
                    if (item) {
                      window.location.href = item.url.replace(
                        "%%REPO_PATH%%",
                        repo[0],
                      );
                    }
                  },
                  condition:
                    aboutRepoInterface &&
                    aboutRepoInterface.some(
                      (item) =>
                        item.category === repo[1].flavor ||
                        item.category === "all",
                    ),
                },
                {
                  type: "menu",
                  icon: <SaveAsOutlinedIcon />,
                  tooltip: "Export",
                  menuItems: itemExportInterface
                    .filter((item) => item.endpoint === repo[1].flavor)
                    .map((item) => ({
                      ...item,
                      url: item.url.replace("%%REPO_PATH%%", repo[0]),
                    })),
                  condition:
                    itemExportInterface.filter(
                      (item) => item.endpoint === repo[1].flavor,
                    ).length > 0,
                },
                {
                  type: "button",
                  interface: tC4ProjectInterface,
                  icon: <FactCheckOutlinedIcon />,
                  action: () => {
                    window.location.href = tC4ProjectInterface[0].url.replace(
                      "%XXX%",
                      repo[1].abbreviation,
                    );
                  },
                  condition: tC4ProjectInterface.length > 0,
                },
                {
                  type: "button",

                  interface: versionManagerInterface,
                  icon: <SvgVersionManager />,
                  action: () => {
                    const vm = versionManagerInterface[0];
                    window.location.href = `${vm.url}?repoPath=${repo[0]}?returnTypePage=dashboard`;
                  },
                  condition:
                    repo[0].includes("_local_/_local_") &&
                    versionManagerInterface.length > 0,
                },
              ]}
            />
          ))
        ) : (
          <Grid2 item>
            <Typography variant="body1" color="gray">
              {doI18n("pages:core-dashboard:my_work_desc", i18nRef.current)}
            </Typography>
          </Grid2>
        )}
      </Grid2>
    </Box>
  );
}

export default App;
