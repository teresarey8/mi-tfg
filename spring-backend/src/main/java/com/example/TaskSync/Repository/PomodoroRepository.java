package com.example.TaskSync.Repository;

import com.example.TaskSync.Entity.Pomodoro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PomodoroRepository extends JpaRepository<Pomodoro, Long> {
    List<Pomodoro> findByTareaId(Long tareaId);

}
