import React, { useState } from 'react';

import Button from '@ui/Button';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { buildRenderURL } from '@utils/updateRequests';
import { dateForExportFilename } from '@utils/formatDate';

import clsx from 'clsx';
import { FlamebearerProfile } from '@models/flamebearer';

interface ExportDataProps {
  exportFlamebearer?: Flamebearer;
}
function ExportData(props: ExportDataProps) {
  const { exportFlamebearer } = props;
  const [toggleMenu, setToggleMenu] = useState(false);

  const formattedDate = () => {
    const cd = new Date();
    const d = cd.getDate() < 10 ? `0${cd.getDate()}` : `${cd.getDate()}`;
    const m = cd.getMonth() < 10 ? `0${cd.getMonth()}` : `${cd.getMonth()}`;
    const y = cd.getFullYear();
    return `${d}_${m}_${y}`;
  };

  // export flamegraph canvas element
  const exportCanvas = function (
    flamebearer: FlamebearerProfile,
    mimeType: 'png',
  ) {
    // TODO use ref
    const canvasElement = document.querySelector(
      '.flamegraph-canvas'
    ) as HTMLCanvasElement;
    const MIME_TYPE = `image/${mimeType}`;
    const imgURL = canvasElement.toDataURL();
    const dlLink = document.createElement('a');
    const dateForFilename = dateForExportFilename(flamebearer.metadata.startTime, flamebearer.metadata.endTime);

    dlLink.download = `${flamebearer.metadata.appName}_${dateForFilename}.${mimeType}`;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(
      ':'
    );

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
    setToggleMenu(!toggleMenu);
  };

  const handleToggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setToggleMenu(!toggleMenu);
  };

  const downloadFlamebearer = function (
    exportObj: Flamebearer,
    exportName: string
  ) {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportObj)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${exportName}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportPProf = function (flamebearer: FlamebearerProfile) {
    const url = `${buildRenderURL({
      from: flamebearer.metadata.startTime,
      until: flamebearer.metadata.endTime,
      query: flamebearer.metadata.query,
      maxNodes: flamebearer.metadata.maxNodes,
    })}&format=pprof`;

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', url);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportHtml = function (flamebearer: FlamebearerProfile) {
    const url = `${buildRenderURL({
      from: flamebearer.metadata.startTime,
      until: flamebearer.metadata.endTime,
      query: flamebearer.metadata.query,
      maxNodes: flamebearer.metadata.maxNodes,
    })}&format=html`;

    const dateForFilename = dateForExportFilename(flamebearer.metadata.startTime, flamebearer.metadata.endTime)
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', url);
    downloadAnchorNode.setAttribute('download', `${flamebearer.metadata.appName}_${dateForFilename}.html`);

    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="dropdown-container">
      <Button icon={faBars} onClick={handleToggleMenu} />

      <div
        className={clsx({ 'menu-show': toggleMenu, 'menu-hide': !toggleMenu })}
      >
        <div className="dropdown-header">Export Flamegraph</div>
        <div>
          <button
            className="dropdown-menu-item"
            onClick={() => exportCanvas(exportFlamebearer, 'png')}
            onKeyPress={() => exportCanvas(exportFlamebearer, 'png')}
            type="button"
          >
            Png
          </button>
          {exportFlamebearer && (
            <button
              className="dropdown-menu-item"
              type="button"
              onClick={() =>
                downloadFlamebearer(exportFlamebearer, 'pyroscope_export')
              }
            >
              Json
            </button>
          )}

          {exportFlamebearer && (
            <button
              className="dropdown-menu-item"
              type="button"
              onClick={() => exportPProf(exportFlamebearer)}
            >
              Pprof
            </button>
          )}

          {exportFlamebearer && (
            <button
              className="dropdown-menu-item"
              type="button"
              onClick={() => exportHtml(exportFlamebearer)}
            >   Html
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportData;
