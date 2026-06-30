import { useState, useEffect } from "react";
import { Eye, EyeOff, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";


export default function DataQualityApp() {
  // Dichiarazione delle costanti
  const dimMinToken = 8;
  interface centerType {
    name: string,
    url: string,
    token: string
  }
  const [selectedCenter, setSelectedCenter] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showTokenCreate, setShowTokenCreate] = useState(false);
  const [showTokenNew, setShowTokenNew] = useState(false);
  const [showTokenOld, setShowTokenOld] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCenter, setCurrentCenter] = useState<centerType>();
  const [verifyToken, setVerifyToken] = useState("");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newToken, setNewToken] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const [openModify, setOpenModify] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

  // Insieme dei centri
  const [centers, setCenters] = useState<{ name: string; url: string; token: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("centers") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("centers", JSON.stringify(centers));
  }, [centers]);

  // Insieme dei centri, ma ordinato in ordine alfabetico
  const sortedCenters = [...centers].sort((a, b) => a.name.localeCompare(b.name));

  // Aggiunge un centro (evita duplicati)
  const addCenter = (name: string, url: string, token: string,) => {
    setCenters((prev) => {
      // Esiste già un centro con tale nome
      if (prev.some((c) => c.name === name)) {
        toast.error("Esiste già un centro con tale nome")
        return prev;
      }
      return [...prev, { name, url, token }];
    });
  };

  // Crea un centro
  const createCenter = () => {
    // Campi mancanti
    if (!newName || !newUrl || !newToken) {
      toast.warning("Compila tutti i campi");
      return;
    }
    // Esiste già un centro con tale nome
    if (centers.some((c) => c.name === newName)) {
      toast.error("Esiste già un centro con tale nome")
      return;
    }
    // Nuovo token non valido
    if (newToken.length < dimMinToken) {
      toast.error(`Token non valido (almeno ${dimMinToken} caratteri)`);
      return;
    }
    setLoading(true)
    addCenter(newName, newUrl, newToken);
    setOpenCreate(false);
    setLoading(false);
    toast.success("Centro creato con successo!");
  };

  // Modifico un centro
  const modifyCenter = (name: string) => {
    setLoading(true)
    try {
      const center = centers.find((c) => c.name === name);
      // Centro non trovato
      if (!center || !currentCenter) {
        throw new Error("Problemi nella ricerca del centro");
      }
      // Token inserito non corretto
      if (verifyToken!==center.token) {
        throw new Error("Token non corretto");
      }
      // Esiste già un centro con tale nome
      if (centers.some((c) => c.name === newName) && (newName!==currentCenter.name)) {
        throw new Error("Esiste già un centro con tale nome");
      }
      // Nuovo token non valido
      if (newToken.length < dimMinToken) {
        throw new Error(`Token non valido (almeno ${dimMinToken} caratteri)`);
      }
      // AZIONE
      setCenters((prev) =>
        prev.map((c) => (c.name === name ? { name: newName, url: newUrl, token: newToken } : c))
      );
      if (selectedCenter === name) {
        setSelectedCenter(newName);
      }
      toast.success("Centro modificato con successo!");
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'operazione");
      return;
    } finally {
      setOpenModify(false);
      setLoading(false);
    }
  };

  // Rimuove un centro
  const removeCenter = (name: string) => {
    setLoading(true);
    try {
      const center = centers.find((c) => c.name === name);
      // Centro non trovato
      if (!center || !currentCenter) {
        throw new Error("Problemi nella ricerca del centro");
      }
      // Token inserito non corretto
      if (verifyToken!==center.token) {
        throw new Error("Token non corretto");
      }
      // AZIONE
      setCenters((prev) => prev.filter((c) => c.name !== currentCenter.name));
      if (selectedCenter === currentCenter.name) {
        setSelectedCenter("");
        setToken("");
      }
      toast.success("Centro eliminato con successo!");
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'operazione");
      return;
    } finally {
      setOpenRemove(false);
      setLoading(false);
    }
  };

  // Cambio il centro selezionato
  const handleCenterChange = (name: string) => {
    setSelectedCenter(name);
    const found = centers.find((c) => c.name === name);
    if (found) {
      const fillToken = confirm("Vuoi precompilare il token per il centro corrispondente?");
      if (fillToken) {
        setToken(found.token);
      } else {
        setToken("");
      }
    } else {
      setToken("");
    }
  };

  // Run DataQuality
  const handleRunDQ = async (name?: string) => {
    setLoading(true);
    try {
      const center = centers.find((c) => c.name === name);
      // Dati mancanti
      if (!selectedCenter || !token) {
        throw new Error("Seleziona un centro e inserisci il token");
      }
      // Simulazione chiamata API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Centro non trovato
      if (!center) {
        throw new Error("Problemi nella ricerca del centro");
      }
      // Token inserito non corretto
      if (token!==center.token) {
        throw new Error("Token non corretto");
      }
      // Creazione dei risultati
      const fakeResult = {
        centerName: center.name,
        centerUrl: center.url,
        totalPatients: 100,
        missingData: 5,
        errors: ["Data non valida"],
        generatedAt: new Date().toISOString(),
      };
      setResult(fakeResult);
    } catch(err: any) {
      toast.error(err.message || "Errore durante l'operazione");
    } finally {
      setLoading(false);
    }
  };

  // Scaricamento dei risultati
  const downloadResult = () => {
    if (!result) return;
    // Creazione del Blob (Binary Large Object)
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dq-result-${selectedCenter}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">

      {/* Titolo */}
      <h1>Data Quality Tool</h1>

      {/* Centro e creazione */}
      <div className="raw">
        <div className="partofRaw">
          <Select
            value={selectedCenter}
            onValueChange={handleCenterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona centro" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem key="" value="">
                - Seleziona centro -
              </SelectItem>
              {sortedCenters.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          className="partofRaw"
          disabled={loading}
          onClick={() => {
            setNewName("");
            setNewUrl("");
            setNewToken("");
            setVerifyToken("");
            setShowTokenCreate(false);
            setOpenCreate(true)
          }}
        >
          Crea centro
        </button>
      </div>

      {/* Token e gestione */}
      <div className="raw">
        <div className="partofRaw">
          <div className="tokenInput">
            <input
              id="token"
              type={showToken ? "text" : "password"}
              value={token}
              placeholder="Inserisci token"
              disabled={loading}
              onChange={(e) => setToken(e.target.value)}
            />
            <button
              type="button"
              className="eye mr-[8px]"
              disabled={loading}
              onClick={() => setShowToken((v) => !v)}
            >
              {showToken && <Eye size={20}/>}
              {!showToken && <EyeOff size={20}/>}
            </button>
          </div>
        </div>
        <button
          className="partofRaw"
          disabled={loading}
          onClick={() => {
            setNewName("");
            setNewUrl("");
            setNewToken("");
            setVerifyToken("");
            setShowTokenCreate(false);
            setShowTokenNew(false);
            setShowTokenOld(false);
            setOpenManage(true);
          }}
        >
          Gestione centri
        </button>
      </div>

      {/* Bottone DQ */}
      <div className="raw">
        <button
          id="runDQ"
          className="manageButton"
          onClick={() => handleRunDQ(selectedCenter)}
          disabled={loading}
        >
          "Esegui Data Quality"
        </button>
      </div>

      {/* Successo */}
      {result && (
        <div className="raw">
          <div className="containerResults">
            <div className="titleResults">✅ &nbsp;&nbsp; <u>Analisi completata</u> &nbsp;&nbsp; ✅</div>
            <ul className="infoResults">
              <li className="scrollText"><b>Centro:</b> {result.centerName}</li>
              <li className="scrollText"><b>Sito:</b> {result.centerUrl}</li>
              <li className="scrollText"><b>Totale pazienti:</b> {result.totalPatients}</li>
              <li className="scrollText"><b>Dati mancanti:</b> {result.missingData}</li>
            </ul>
            <button
              id="downloadResults"
              onClick={downloadResult}
              className="manageButton"
            >
              Scarica risultati
            </button>
          </div>
        </div>
      )}

      {/* Dialog di Creazione centro */}
      <Dialog
        open={openCreate}
        onOpenChange={(open) => {
          setOpenCreate(open);
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              <div>
                <b><u>Crea centro</u></b>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="dialogBody">
            <input
              placeholder="Nome"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              placeholder="URL sito"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <div className="tokenInput">
              <input
                type={showTokenCreate ? "text" : "password"}
                placeholder="Token"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowTokenCreate((v) => !v)}
              >
                {showTokenCreate && <Eye size={20}/>}
                {!showTokenCreate && <EyeOff size={20}/>}
              </button>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setOpenCreate(false);
              }}
            >
              Annulla
            </button>
            <button className="manageButton" onClick={() => createCenter()}>Crea</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog di Gestione centro */}
      <Dialog
        open={openManage}
        onOpenChange={(open) => {
          setOpenManage(open);
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              <div>
                <b><u>Gestione centri</u></b>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="dialogBody">
            {centers.length === 0 && <p>Nessun centro configurato.</p>}
            {sortedCenters.map((c) => (
              <div key={c.name} className="flex flex-row justify-between">
                <div className="infoCenter">
                  <p className="text-[16px]">{c.name}</p>
                  <p className="text-[12px]"><i>{c.url}</i></p>
                </div>
                <div className="buttonZone">
                  <button
                    onClick={() => {
                      setNewToken("");
                      setVerifyToken("");
                      setShowTokenCreate(false);
                      setShowTokenNew(false);
                      setShowTokenOld(false);
                      setCurrentCenter(c);
                      setNewName(c.name);
                      setNewUrl(c.url);
                      setOpenModify(true);
                    }}
                    className="manageButton"
                  >
                    <Pencil />
                  </button>
                  <button
                    onClick={() => {
                      setNewToken("");
                      setVerifyToken("");
                      setShowTokenNew(false);
                      setShowTokenOld(false);
                      setCurrentCenter(c);
                      setNewName(c.name);
                      setNewUrl(c.url);
                      setOpenRemove(true);
                    }}
                    className="manageButton"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <button onClick={() => setOpenManage(false)}>Chiudi</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog di Modifica centro */}
      {currentCenter && (
        <Dialog 
          open={openModify}
          onOpenChange={(open) => {
            setNewName("");
            setNewUrl("");
            setNewToken("");
            setVerifyToken("");
            setOpenModify(open);
          }}
        >
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                <div>
                  <b><u>Modifica centro</u></b>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="scrollText">
              <i>{currentCenter.name}</i>
            </div>
            <div className="dialogBody">
              <input
                placeholder="Nuovo nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                placeholder="Nuovo URL sito"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <div className="tokenInput">
                <input
                  type={showTokenNew ? "text" : "password"}
                  placeholder="Nuovo token"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowTokenNew((v) => !v)}
                >
                  {showTokenNew && <Eye size={20}/>}
                  {!showTokenNew && <EyeOff size={20}/>}
                </button>
              </div>
              <div className="tokenInput">
                <input
                  type={showTokenOld ? "text" : "password"}
                  placeholder="Vecchio token"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowTokenOld((v) => !v)}
                >
                  {showTokenOld && <Eye size={20}/>}
                  {!showTokenOld && <EyeOff size={20}/>}
                </button>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setOpenModify(false)}>Annulla</button>
              <button className="manageButton" onClick={() => modifyCenter(currentCenter.name)}>Conferma</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog di Rimozione centro */}
      {currentCenter && (
        <Dialog
          open={openRemove}
          onOpenChange={(open) => {
            setNewName("");
            setNewUrl("");
            setNewToken("");
            setVerifyToken("");
            setOpenRemove(open);
          }}
        >
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                <div>
                  <b><u>Rimuovi centro</u></b>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="scrollText">
              <i>{currentCenter.name}</i>
            </div>
            <p>Inserisci il token per confermare.</p>
            <div className="tokenInput">
              <input
                type={showTokenOld ? "text" : "password"}
                placeholder="Token"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
              <button
                type="button"
                className="eye"
                onClick={() => setShowTokenOld((v) => !v)}
              >
                {showTokenOld && <Eye size={20}/>}
                {!showTokenOld && <EyeOff size={20}/>}
              </button>
            </div>
            <DialogFooter>
              <button onClick={() => setOpenRemove(false)}>Annulla</button>
              <button className="manageButton" onClick={() => removeCenter(currentCenter.name)}>Conferma</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
