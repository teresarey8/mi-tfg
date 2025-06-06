package com.example.TaskSync.Controller;

import com.example.TaskSync.Entity.Pomodoro;
import com.example.TaskSync.Repository.PomodoroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pomodoros")
@CrossOrigin(origins = "*")
public class PomodoroController {

    @Autowired
    private PomodoroRepository pomodoroRepository;

    @GetMapping
    public List<Pomodoro> getAllPomodoros() {
        return pomodoroRepository.findAll();
    }

    @PostMapping
    public Pomodoro createPomodoro(@RequestBody Pomodoro pomodoro) {
        return pomodoroRepository.save(pomodoro);
    }

    @PutMapping("/{id}")
    public Pomodoro updatePomodoro(@PathVariable Long id, @RequestBody Pomodoro pomodoroDetails) {
        Pomodoro pomodoro = pomodoroRepository.findById(id).orElseThrow();
        pomodoro.setInicio(pomodoroDetails.getInicio());
        pomodoro.setFin(pomodoroDetails.getFin());
        pomodoro.setCompletado(pomodoroDetails.isCompletado());
        return pomodoroRepository.save(pomodoro);
    }

    @DeleteMapping("/{id}")
    public void deletePomodoro(@PathVariable Long id) {
        pomodoroRepository.deleteById(id);
    }
}