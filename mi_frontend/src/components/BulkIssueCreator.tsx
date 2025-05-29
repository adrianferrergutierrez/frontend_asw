// src/components/BulkIssueCreator.tsx
import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Alert, CircularProgress } from '@mui/material';

interface BulkIssueCreatorProps {
  onClose: () => void;
  onSuccess: (createdIds: number[]) => void;
}

function BulkIssueCreator({ onClose, onSuccess }: BulkIssueCreatorProps) {
  const [issueNamesInput, setIssueNamesInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_BASE_URL = 'https://waslab04-p1hk.onrender.com/api/v1';
  const API_KEY = 'TU_API_KEY_AQUI'; 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const names = issueNamesInput.split('\n')
                                 .map(name => name.trim())
                                 .filter(name => name.length > 0);

    if (names.length === 0) {
      setError('Por favor, introduce al menos un nombre de issue.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/issues/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token token=${API_KEY}`
        },
        body: JSON.stringify(names),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData && typeof errorData.error === 'string') {
          throw new Error(errorData.error);
        } else {
          throw new Error('Error desconocido al crear issues.');
        }
      }

      const createdIssueIds: number[] = await response.json();
      onSuccess(createdIssueIds);
      setIssueNamesInput('');
      onClose();
    } catch (err: unknown) {
      console.error('Error en la petición:', err);
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Ha ocurrido un error inesperado al procesar la solicitud.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ¡QUITADO! <Typography variant="h6">Bulk Issues</Typography> */}
      
      <Typography variant="body2" color="text.secondary">
        Introduce los nombres de los issues, uno por línea. Cada línea creará un nuevo issue.
      </Typography>

      <TextField
        id="issueNames"
        label="Nombres de Issues"
        multiline
        rows={10}
        value={issueNamesInput}
        onChange={(e) => setIssueNamesInput(e.target.value)}
        fullWidth
        placeholder="Ej:&#10;Bug en login&#10;Implementar nueva característica&#10;Revisar rendimiento"
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'SAVE'}
        </Button>
      </Box>
    </Box>
  );
}

export default BulkIssueCreator;