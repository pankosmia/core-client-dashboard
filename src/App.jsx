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
import { getAndSetJson, doI18n, postEmptyJson, getJson } from "pithekos-lib";
import { i18nContext, netContext, debugContext } from "pankosmia-rcl";
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SvgVersionManager from "./fileIcons/iconVersionManager";
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
  const [showWelcome, setShowWelcome] = useState(localStorage.getItem("showWelcome") === null ? true : false,);
  const [clientInterfaces, setClientInterfaces] = useState({});
  console.log("clientInterfaces", clientInterfaces)
  const [createAnchorEl, setCreateAnchorEl] = useState(null);
  const { i18nRef } = useContext(i18nContext);
  const { enabledRef } = useContext(netContext);
  const { debugRef } = useContext(debugContext);
  const matchPart = '/createDocument/textTranslation';
  const editableRepos = Object.entries(projectSummaries).filter(([repoPath, project]) => repoPath.startsWith("_local_/_local_") && !repoPath.includes("images") && editTable[project.flavor],);
  console.log("edit", editableRepos)
  const [chooseRepo, setChooseRepo] = useState(null);
  console.log("chooseRepo", chooseRepo);
  const [contentRowAnchorEl, setContentRowAnchorEl] = useState(null);
  const contentRowOpen = Boolean(contentRowAnchorEl);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState(null);
  const createItems = (() => {
    if (!clientInterfaces) return [];

    const all = Object.entries(clientInterfaces).flatMap(([category, cv]) => Object.values(cv?.endpoints || {}).flatMap(ev => (ev?.create_document || []).map(doc => ({
      category,
      label: doI18n(doc.label, i18nRef.current),
      url: `/clients/${category}#${doc.url}?returntypepage=dashboard`,
    }))));
    // move "Biblical Text" to the front if present
    const idx = all.findIndex(i => i.url === matchPart || i.url.includes(matchPart));
    if (idx > -1) all.unshift(all.splice(idx, 1)[0]);

    return all;
  })();
  const getProjectSummaries = async () => {
    const summariesResponse = await getJson(`/burrito/metadata/summaries`, debugRef.current,);
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
      url: "/list-clients", setter: setClients,
    }).then();
  }, []);

  const handleSubMenuClick = (event) => {
    setSubMenuAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    getJson("/client-interfaces")
      .then((res) => res.json)
      .then((data) => {
        setEditTable(getEditDocumentKeys(data));
        setClientInterfaces((data))
      })
      .catch((err) => console.error("Error :", err));
  }, []);

  let createItemExport;
  if (clientInterfaces) {
    createItemExport = Object.entries(clientInterfaces).flatMap(
      ([category, categoryValue]) => {
        const endpoints = categoryValue?.endpoints ?? {};
        return Object.entries(endpoints).flatMap(
          ([endpointKey, endpointValue]) => {
            const exportsArray = endpointValue?.export;
            if (!Array.isArray(exportsArray)) return [];

            return exportsArray.flatMap((doc) => {
              const flavorItems = doc?.subMenu?.[0];
              if (!flavorItems) return [];

              return Object.entries(flavorItems).flatMap(([key, items]) =>
                items.map((item) => ({
                  category: endpointKey, // top-level category
                  endpoint: endpointKey, // endpoint name
                  key, // flavor type (pdf/usfm/zip)
                  label: doI18n(item.label, i18nRef.current),
                  url:
                    "/clients/" +
                    category +
                    "#" +
                    item.url.replace("%%REPO_PATH%%", chooseRepo),
                })),
              );
            });
          },
        );
      },
    );
  }


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
  };

  return (
    <Box
      sx={{
        mb: 2, position: "fixed", top: "64px", bottom: 0, right: 0, overflow: "auto", width: "100%",
      }}
    >
      <Grid2 container spacing={2} sx={{ m: 2 }}>
        {showWelcome && (<Grid2 item size={12}>
          <Card elevation={1} sx={{ backgroundColor: "#E5F6FD" }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {doI18n("pages:core-dashboard:welcome", i18nRef.current)}
              </Typography>
              <Typography sx={{ mt: 2 }} color="gray" variant="body2">
                {`${doI18n("branding:software:name", i18nRef.current,)} ${doI18n("pages:core-dashboard:welcome_desc1", i18nRef.current,)}`}
                <br />
                {doI18n("pages:core-dashboard:welcome_desc2", i18nRef.current,)}
                <br />
                <br />
                {`${doI18n("branding:software:name", i18nRef.current,)} ${doI18n("pages:core-dashboard:welcome_desc3", i18nRef.current,)}`}
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
        </Grid2>)}
        <Grid2 item size={12}>
          <Stack direction="row" spacing={1}>
            {!enabledRef?.current ? (<Tooltip
              slotProps={{
                popper: {
                  modifiers: [{ name: "offset", options: { offset: [15, -5] } },],
                },
              }}
              title={doI18n("pages:core-dashboard:connect_to_internet", i18nRef.current,)}
            >
              <span>
                <Chip
                  label={doI18n("pages:core-dashboard:download_from_internet", i18nRef.current,)}
                  color="secondary"
                  variant="outlined"
                  disabled
                />
              </span>
            </Tooltip>) : (<Chip
              label={doI18n("pages:core-dashboard:download_from_internet", i18nRef.current,)}
              color="secondary"
              variant="outlined"
              onClick={() => (window.location.href = "/clients/download")}
            />)}
            <Chip
              label={doI18n("pages:core-dashboard:go_to_documents", i18nRef.current,)}
              color="secondary"
              variant="outlined"
              onClick={() => (window.location.href = "/clients/content")}
            />
            <Chip
              label={doI18n("pages:core-dashboard:create_content", i18nRef.current)}
              color="secondary"
              variant="outlined"
              onClick={(event) => setCreateAnchorEl(event.currentTarget)}
            />
            <Menu
              id="grouped-menu"
              anchorEl={createAnchorEl}
              open={!!createAnchorEl}
              onClose={handleCreateClose}
            >
              {createItems.map((item) => (
                <MenuItem onClick={() => (window.location.href = item.url)}>{item.label}</MenuItem>))}
            </Menu>
          </Stack>
        </Grid2>
        <Grid2 item size={12} sx={{ mt: 2 }}>
          <Typography variant="h5">
            {doI18n("pages:core-dashboard:my_work", i18nRef.current)}
          </Typography>
        </Grid2>
        {editableRepos.length > 0 ? (editableRepos.map((repo) => (<Grid2 item size={{ xs: 12, md: 6, xl: 4 }}>
          <Card elevation={1}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <CardActionArea
                onClick={async () => {
                  const fullMetadataResponse = await getJson(`/burrito/metadata/raw/${repo[0]}`,);
                  if (fullMetadataResponse.ok) {
                    const bookCodes = Object.entries(fullMetadataResponse.json.ingredients,)
                      .map((i) => Object.keys(i[1].scope || {}))
                      .reduce((a, b) => [...a, ...b], []);
                    await postEmptyJson(`/navigation/bcv/${bookCodes[0]}/1/1`,);
                    await postEmptyJson(`/app-state/current-project/${repo[0]}`,);
                    window.location.href = "/clients/" + editTable[repo[1].flavor];
                  } else {
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
                      {doI18n(`flavors:names:${flavorTypes[repo[1].flavor.toLowerCase()]}/${repo[1].flavor}`, i18nRef.current,)}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{ color: "text.secondary" }}
                    >
                      {repo[1].abbreviation}
                    </Typography>
                    {repo[1].book_codes.length > 0 && (<Typography
                      variant="subtitle1"
                      component="div"
                      sx={{ color: "text.secondary" }}
                    >
                      {`${repo[1].book_codes.length} ${doI18n(`pages:core-dashboard:book${repo[1].book_codes.length === 1 ? "" : "s"}`, i18nRef.current,)}`}
                    </Typography>)}
                  </Box>
                </CardContent>
              </CardActionArea>
              <Box sx={{ display: "flex", flexDirection: "column", margin: "4px" }}>
                <Tooltip title="Version manager" disableInteractive placement="right">
                  <IconButton onClick={() => (window.location.href = `/clients/core-contenthandler_version_manager#/versionManager/?repoPath=${repo[0]}`)}>
                    <SvgVersionManager />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Save as..." disableInteractive placement="right" onClick={(event) => {
                  handleSubMenuClick(event);
                  setChooseRepo(repo[0]);
                }}>
                  <IconButton>
                    <SaveAsOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  id="basic-sub-menu"
                  anchorEl={subMenuAnchorEl}
                  open={Boolean(subMenuAnchorEl)}
                  onClose={() => {
                    setContentRowAnchorEl(null);
                    setSubMenuAnchorEl(null);
                  }}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{ list: { "aria-labelledby": "basic-button" } }}
                >
                  {createItemExport &&
                    createItemExport
                      .filter((item) => item.endpoint === repo[1].flavor)
                      .map((item) => (
                        <MenuItem
                          key={item.label}
                          onClick={() => (window.location.href = item.url)}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                  <MenuItem
                    onClick={(event) => {
                      //setExportBurritoAnchorEl(event.currentTarget);
                      setContentRowAnchorEl(null);
                      setSubMenuAnchorEl(null);
                    }}
                  >
                    {doI18n("pages:content:export_burrito", i18nRef.current)}
                  </MenuItem>
                </Menu>

                <Tooltip title="Properties" disableInteractive placement="right">
                  <IconButton>
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Card>
        </Grid2>))) : (<Grid2 item>
          <Typography variant="body1" color="gray">
            {doI18n("pages:core-dashboard:my_work_desc", i18nRef.current)}
          </Typography>
        </Grid2>)}
      </Grid2>
    </Box>
  );
}

export default App;
