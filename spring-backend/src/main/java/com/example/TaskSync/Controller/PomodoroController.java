package com.example.TaskSync.Controller;

import com.example.TaskSync.Entity.Pomodoro;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Repository.PomodoroRepository;
import com.example.TaskSync.Repository.TareaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/pomodoros")
@CrossOrigin(origins = "*")
public class PomodoroController {

    @Autowired
    private PomodoroRepository pomodoroRepository;

    @Autowired
    private TareaRepository tareaRepository;

    @GetMapping
    public List<Pomodoro> getAllPomodoros() {
        return pomodoroRepository.findAll();
    }

    @GetMapping("/tarea/{tareaId}")
    public List<Pomodoro> getPomodorosByTarea(@PathVariable Long tareaId) {
        return pomodoroRepository.findByTareaId(tareaId);
    }

    @PostMapping("/{tareaId}")
    public Pomodoro createPomodoro(@PathVariable Long tareaId) {
        Tarea tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + tareaId));

        Pomodoro pomodoro = new Pomodoro();
        pomodoro.setTareaId(tareaId);
        pomodoro.setInicio(OffsetDateTime.now());
        pomodoro.setFin(pomodoro.getInicio().plusMinutes(tarea.getDuracionMinutos()));
        pomodoro.setCompletado(false);

        return pomodoroRepository.save(pomodoro);
    }

    @PutMapping("/{pomodoroId}/complete")
    public Pomodoro completarPomodoro(@PathVariable Long pomodoroId) {
        Pomodoro pomodoro = pomodoroRepository.findById(pomodoroId)
                .orElseThrow(() -> new RuntimeException("Pomodoro no encontrado con id: " + pomodoroId));

        pomodoro.setFin(OffsetDateTime.now());
        pomodoro.setCompletado(true);

        return pomodoroRepository.save(pomodoro);
    }

    @DeleteMapping("/{id}")
    public void deletePomodoro(@PathVariable Long id) {
        pomodoroRepository.deleteById(id);
    }
}
